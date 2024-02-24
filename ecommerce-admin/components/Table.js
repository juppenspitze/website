import { DeleteIcon, EditIcon } from "@/Icons/Icons";
import { formatDateMini, timeConverter } from "@/lib/date";
import currencyForm, { handleApiCall } from "@/lib/handlers";
import { Input,Button,Table,TableHeader,TableColumn,TableBody,TableRow,TableCell,Tooltip,Pagination,Modal,ModalContent,ModalHeader,ModalBody,ModalFooter,useDisclosure,Avatar, Checkbox } from "@nextui-org/react";
import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import DragAndDrop from "./DragAndDrop";
import Editor from "./Editor";
import { FaRegEnvelope } from "react-icons/fa6";
import { CheckCircle, Hourglass, Package, Stethoscope } from "lucide-react";
import parse from 'html-react-parser';
import generatePdf from "./pdf/PdfGenerator";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

const statusColorMap = {
  processing: {icon: <Hourglass className="w-4 h-4"/>, color: "text-gray-500"},
  packed: {icon: <Package className="w-4 h-4"/>, color: "text-warning-400"},
  shipped: {icon: <CheckCircle className="w-4 h-4"/>, color: "text-success-400"},
};

export default function CustomTable({ items,columns,editFunc,deleteFunc,unDeprecateFunc,isEmailable,pagination,shipmentProfiles,countries }) {
  const tTable = useTranslations("Table");
  const tOrderStatus = useTranslations("Orders.Statuses");
  const tOrderEmail = useTranslations("Orders.Email");
  const tTableButtons = useTranslations("Buttons");

  const [recipient, setRecipient] = useState("");
  const [theme, setTheme] = useState("Your recent order from Juppenspitze");
  const [html, setHtml] = useState("<h1>Test</h1><p>Lorem ipsum dolor sit amet</p>");
  const [attachments, setAttachments] = useState([]);
  const [order, setOrder] = useState();
  const [includeInvoice, setIncludeInvoice] = useState(false);
  const {locale} = useRouter();

  const [locCountries, setLocCountries] = useState(countries || []);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  //email stuff
  async function sendEmail() {
    if (!recipient || !theme || !html) return;
    let locAttachments = [...attachments];

    if (includeInvoice && order) {
      const invoicePdf = await generatePdf(order);
      locAttachments = [...attachments, invoicePdf]
    };

    const data = { recipient, theme, html, attachments:locAttachments, orderId:order?._id };
    await handleApiCall(axios.post("/api/emails", data), "sending email");
    locAttachments = [];
    clearEmail();
  };
  function onEmailSend(ev, order) {
    ev.preventDefault();
    setRecipient(order.email);
    setOrder(order);
    onOpen();
  };
  function clearEmail() {
    setRecipient("");
    setTheme("Your recent order from Juppenspitze");
    setHtml("<h1>Test</h1><p>Lorem ipsum dolor sit amet</p>");
    setAttachments([]);
    onOpenChange();
  };
  function onFilesChange(newFiles) {
    console.log("new files:", newFiles);
    let newAttachments = [];
    if (newFiles.length > 0) {
      for (const newFile of newFiles) {
        let attachment = {
          filename: newFile.name,
          path: newFile.link,
        };
        newAttachments.push(attachment);
      }
    }
    setAttachments(newAttachments);
  };
  function onHtmlChange(newHtml) {
    setHtml(newHtml);
  };

  //table stuff
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  var pages = 0;
  var onRowsPerPageChange;
  pages = Math.ceil(items.length / rowsPerPage);
  items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return items.slice(start, end);
  }, [page, items]);
  onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const renderCell = useCallback((item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      //admins
      case "email":
        return <div>{item.email}</div>;
      case "date":
        return <div>{item.createdAt && formatDateMini(item.createdAt)}</div>;

      //categories
      case "cName":
        return <div>{item.name}</div>;
      case "parent":
        return (
          <>
            {item?.parent?.name ? (
              <div className="">{item.parent.name}</div>
            ) : (
              <div className="text-gray-400">{tTable('no_parent_item')}</div>
            )}
          </>
        );

      //orders
      case "state":
        return (
          <>
            <div className="flex flex-col items-center justify-center w-2/4 gap-1">
              <div
                className={
                  item.state
                    ? statusColorMap[item.state].color
                    : statusColorMap["processing"].color
                }
              >{statusColorMap[item.state].icon}</div>
              <span className="text-xs whitespace-nowrap text-center text-textSecondary capitalize">
                {item.state ? tOrderStatus(item.state) : tOrderStatus('processing')}
              </span>
            </div>
          </>
        );
      case "paid":
        return (
          <div className={item.paid ? "text-primary" : "text-danger"}>
            {item.paid ? tTable('yes') : tTable('no')}
          </div>
        );
      case "recipient":
        return (
          <div className="text-textSecondary">
            <span className="font-semibold text-foreground">
              {item.name ? item.name : "No name"}
            </span>{" "}
            <br />
            <span>{item.email ? item.email : tTable('Empties.no_email')}</span> <br />
            <span>
              {item.streetAddress ? item.streetAddress + "," : tTable('Empties.no_street')}{" "}
              {item.postalCode ? item.postalCode + "," : tTable('Empties.no_code')}{" "}
              {item.city ? item.city + "," : tTable('Empties.no_city')}{" "}
              {item.countryId ? locCountries.find(c => c._id === item.countryId).name : tTable('Empties.no_country')}
            </span>
          </div>
        );
      case "products":
        return (
          <div className="relative flex items-center gap-2 text-textSecondary">
            {item.line_items.map((l) => (
              <span key={l.price_data?.product_data.name}>
                {l.price_data?.product_data.name} x{l.quantity}
                <br />
              </span>
            ))}
          </div>
        );

      //products
      case "pName":
        return <div>{item.title}</div>;
      case "price":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize text-textSecondary">
              {item.price ? currencyForm(item.price) : tTable('Empties.not_set')}
            </p>
          </div>
        );
      case "stock":
        return (
          <>
            <div className="flex flex-col">
              <div className="text-bold text-sm capitalize text-textSecondary">
                {!item.stock && item.stock != 0 && (<div className="text-textSecondary">{tTable('Empties.not_set')}</div>)}

                {item.stock == 0 && (<div className="text-danger">{item.stock}</div>)}
                {item.stock < 10 && item.stock != 0 && <div className="text-warning">{item.stock}</div>}
                {item.stock >= 10 && <div>{item.stock}</div>}
              </div>
            </div>
          </>
        );

      //authors
      case "authorName":
        return <div>{item.authorName}</div>;
      case "description":
        return <div>{parse(item.description?.[locale] || item.description?.['en'] || tTable('Empties.not_set'))}</div>;
      case "authorImage":
        return (
          <>
            {item.authorId || item.image ? (
              <Tooltip content={item.authorName} className="my-auto">
                <Avatar
                  size="small"
                  src={item.authorImage ? item.authorImage : item.image}
                />
              </Tooltip>
            ) : (
              <div className="text-textSecondary">{tTable('Empties.not_set')}</div>
            )}
          </>
        );

      //shipment methods
      case "countries":
        return (
          <>
          {locCountries && locCountries.length > 0 && (
            <div className="flex flex-col gap-2 text-textSecondary">
              {item.countries?.length > 0 && item.countries.map((c, index) => (
                <div key={`${c.countryId}${index}`}>
                  {locCountries.find(co => co._id === c.countryId).name} - {currencyForm(c.baseFee)}
                  <br />
                </div>
              ))}
            </div>
          )}
          </>
        );
      case "profiles":
        return (
          <>
            {item.profiles && item.profiles.length > 0 && (
              <div className="flex flex-col gap-2 text-textSecondary">
                {shipmentProfiles &&
                  shipmentProfiles.length > 0 &&
                  item.profiles &&
                  item.profiles.map((p, index) => (
                    <div key={`${p._id}${index}`}>
                      {shipmentProfiles.find((profile) => profile._id === p.profileId).profileName} - {currencyForm(p.profileFee)}
                      <br />
                    </div>
                  ))}
              </div>
            )}
            {item.profileId && shipmentProfiles && (
              <div className="flex flex-col gap-2 text-textSecondary">
                <div key={item.profileId}>
                  {
                    shipmentProfiles.find(
                      (profile) => profile._id === item.profileId
                    ).profileName
                  }
                  <br />
                </div>
              </div>
            )}

            {!item.profiles && !item.profileId && (
              <div className="text-textSecondary">{tTable('Empties.not_set')}</div>
            )}
          </>
        );

      //everywhere
      case "actions":
        return (
          <>
            <div className="relative flex items-center gap-2">
              {editFunc && !item.isDeprecated && (
                <Tooltip content={tTableButtons('edit')}>
                  <a
                    onClick={() => editFunc(item)}
                    className="text-lg text-textSecondary cursor-pointer active:opacity-50"
                  >
                    <EditIcon />
                  </a>
                </Tooltip>
              )}
              {deleteFunc && !item.isDeprecated && (
                <Tooltip color="danger" content={tTableButtons('delete')}>
                  <a
                    onClick={() => deleteFunc(item)}
                    className="text-lg text-danger cursor-pointer active:opacity-50"
                  >
                    <DeleteIcon />
                  </a>
                </Tooltip>
              )}
              {unDeprecateFunc && item.isDeprecated && (
                <Tooltip color="warning" content={tTableButtons('undeprecate')}>
                  <a
                    onClick={() => unDeprecateFunc(item)}
                    className="text-lg text-warning cursor-pointer active:opacity-50"
                  >
                    <Stethoscope className="w-5 h-5" />
                  </a>
                </Tooltip>
              )}
              {isEmailable && (
                <Tooltip content={tTableButtons('email')}>
                  <a
                    onClick={(ev) => onEmailSend(ev, item)}
                    className="text-lg text-textSecondary cursor-pointer active:opacity-50"
                  >
                    <FaRegEnvelope />
                  </a>
                </Tooltip>
              )}
            </div>
          </>
        );
      default:
        return cellValue;
    }
  }, []);

  var bottomPagination;
  if (pagination && items.length != 0) {
    bottomPagination = (
      <div className="flex w-full justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={(page) => setPage(page)}
        />
      </div>
    );
  } else {
    bottomPagination = "";
  }

  return (
    <>
      <Table
        className="[&>div]:bg-background max-w-[calc(100vw-32px)] print:hidden"
        aria-label="Example table with custom cells"
        bottomContent={bottomPagination}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              className="uppercase"
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {tTable(`ColumnNames.${column.name}`)}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={tTable('no_data')} items={items}>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination && (
        <div className="flex mt-3 w-fit print:hidden">
          <div className="text-sm text-textSecondary">{tTable('rows_per_page')}</div>
          <select
            className="bg-transparent outline-none text-textSecondary text-small"
            value={rowsPerPage}
            onChange={onRowsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </div>
      )}

      <Modal backdrop={"blur"} className="bg-background" isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="2xl" isDismissable={false}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div>
                {tOrderEmail('send_email_to')}{" "}
                <span className="text-primary">{recipient}</span>
              </div>
            </ModalHeader>
            <ModalBody className="max-h-[calc(100vh-252px)]">
              <div className="flex flex-col gap-3.5">
                <Input classNames={{ inputWrapper: ["shadow-lg"] }} isDisabled label={tOrderEmail('reciever')} type="email" value={recipient} />
                <Input isRequired label={tOrderEmail('subject')} value={theme} onChange={(ev) => setTheme(ev.target.value)} placeholder={tOrderEmail('subject_description')} />
                <div className="flex flex-col gap-1">
                  <span className="text-textSecondary">{tOrderEmail('message')}</span>
                  <Editor onHtmlChange={onHtmlChange} />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-textSecondary">{tOrderEmail('attachments')}</span>
                  <DragAndDrop onFilesChange={onFilesChange} />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Checkbox className="mr-auto" color="primary" checked={includeInvoice} onChange={(e) => setIncludeInvoice(e.target.checked)}>
                {tOrderEmail('include_invoice')}
              </Checkbox>
              <Button variant="light" onClick={clearEmail}>
                {tTableButtons('cancel')}
              </Button>
              <Button isDisabled={!recipient || !theme || !html} color="primary" type="submit" onClick={sendEmail}>
                {tTableButtons('send')}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
