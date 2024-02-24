import Layout from "@/components/Layout";
import {useCallback, useEffect, useMemo, useState} from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import CustomTable from "@/components/Table";
import { CustomRadio } from "@/components/CustomRadio";
import { debounce } from "lodash";
import { RadioGroup, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Kbd, Input } from "@nextui-org/react";
import { FaChevronDown } from "react-icons/fa6";
import OrderData from "@/components/OrderData";
import download from 'downloadjs';
import generatePdf from "@/components/pdf/PdfGenerator";
import { base64ToBlob, handleApiCall } from "@/lib/handlers";
import useHotKey from "@/hooks/useHotKey";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export default function OrdersPage() {
  const tOrders = useTranslations('Orders');
  const tOrderStatuses = useTranslations('Orders.Statuses');
  const tOrderButtons = useTranslations('Buttons');

  const [orders,setOrders] = useState([]);
  const [isLoading,setIsLoading] = useState(false);

  const [editingOrder, setEditingOrder] = useState();
  const [shipmentMethod, setShipmentMethod] = useState();
  const [isOrderPaid, setIsOrderPaid] = useState();
  const [origOrderPaid, setOrigOrderPaid] = useState();
  const [orderState, setOrderState] = useState('');
  const [origOrderState, setOrigOrderState] = useState('');
  const [orderToPrint, setOrderToPrint] = useState();
  const [countries, setCountries] = useState([]);

  const [stateFilter,setStateFilter] = useState('all');
  const [phrase,setPhrase] = useState('');
  const debouncedSearch = useCallback(
    debounce(searchOrders, 500), []
  );

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  if (typeof window !== 'undefined') {
    window.onbeforeprint = function() {
      console.log("before print", editingOrder)
      if (!editingOrder) return;
      setOrderToPrint(editingOrder);
      onOpenChange();
    };
    window.onafterprint = function() {
      setOrderToPrint();
      onOpen();
    };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    debouncedSearch(phrase);
  }, [phrase]);

  async function searchOrders(phrase) {
    const response = await axios.get('/api/orders?phrase='+encodeURIComponent(phrase));
    setOrders(response.data);
    setIsLoading(false);
  };

  useHotKey('KeyS', downloadPdf);

  const filteredOrders = useMemo(() => {
    let filtOrd = orders;
    if (stateFilter !== "all") {
      filtOrd = filtOrd.filter((order) =>
        Array.from(stateFilter).includes(order.state),
      );
    };

    return filtOrd;
  }, [orders,stateFilter]);

  async function fetchOrders() {
    setIsLoading(true);
    const res = await handleApiCall(axios.get('/api/orders'), 'fetching orders', false);
    setOrders(res.data);
    const res2 = await handleApiCall(axios.get('/api/countries'), 'fetching countries', false);
    setCountries(res2.data);
    setIsLoading(false);
  };
  async function onEdit(order) {
    if (!order) return;
    console.log(order);
    setEditingOrder(order);
    const res = await handleApiCall(axios.get('/api/countries?id='+ order.countryId.toString()), 'fetching countries', false);
    order.country = res.data.name;
    if (order.state) { 
      setOrderState(order.state);
      setOrigOrderState(order.state);
      setOrigOrderPaid(order.paid);
    } else { 
      setOrderState('processing');
      setOrigOrderState('processing');
    };
    if (order.shipmentMethodId) {
      let method = await handleApiCall(axios.get('/api/shipment-methods?id='+order.shipmentMethodId), 'fetching shipment method', false);
      setShipmentMethod(method.data);
    };
    setIsOrderPaid(order.paid);
    onOpen();
  };
  async function saveOrder() {
    if (!editingOrder) return;
    let _id = editingOrder._id;
    if (orderState === 'shipped' && origOrderState !== 'shipped' && isOrderPaid) updateProduct('negate');
    if (orderState !== 'shipped' && origOrderState === 'shipped' && origOrderPaid) updateProduct('add');
    await handleApiCall(axios.put('/api/orders', {state:orderState, paid:isOrderPaid, _id}), 'updating order');
    fetchOrders();
    onOpenChange();
  };
  function finishOrderEdit() {
    setEditingOrder();
    setShipmentMethod();
    onOpenChange();
  };

  function updateProduct(action) {
    editingOrder.line_items.forEach(async (item) => {
      let _id = item.price_data.product_data.metadata._id;
      let stock = item.quantity;
      let origStock,origSold,amountSold = 0;
      const res = await handleApiCall(axios.get('/api/products', {params:{id:_id}}), 'fetching product', false);
      if (typeof res.data.stock == 'undefined') origStock = 0;
      else origStock = res.data.stock;
      if (typeof res.data.amountSold == 'undefined') origSold = 0;
      else origSold = res.data.amountSold;

      if (action === 'negate') { 
        if (origStock >= stock) stock = origStock - stock; 
        amountSold = origSold + item.quantity;
      } else if (action === 'add') { 
        stock = origStock + stock; 
        if (origSold >= item.quantity) amountSold = origSold - item.quantity; 
      };

      await handleApiCall(axios.put('/api/products', {_id,stock,amountSold}), 'updating product', false);

      if (stock <= 10) {
        console.log('low stock');
        if (stock <= 0) toast.error('Out of stock', {description: `Product ${res.data.title} is out of stock.`});
        else toast.warning('Low stock', {description: `Product ${res.data.title} is low on stock: ${stock} left.`});
      };
    });
  };

  function startManualPrint() {
    if (!editingOrder || !window) return;
    setOrderToPrint(editingOrder);
    onOpenChange();
    setTimeout(() => {
      window.print();
      setOrderToPrint();
      onOpen();
    }, 100);
  };
  async function downloadPdf() {
    if (!editingOrder) return;
    const pdf = await generatePdf(editingOrder, shipmentMethod?.name);
    const pdfBlob = base64ToBlob(pdf.split(",")[1]);
    download(pdfBlob, `invoice_no_${editingOrder._id}.pdf`, 'application/pdf');
  };

  const columns = [
    {name: "state", uid: "state"},    
    {name: "date", uid: "date"},
    {name: "paid", uid: "paid"},
    {name: "recipient", uid:"recipient"},
    {name: "products", uid: "products"},
    {name: "actions", uid: "actions"}
  ];
  const stateOptions = [
    {name: "processing", uid: "processing"},
    {name: "packed", uid: "packed"},
    {name: "shipped", uid: "shipped"},
  ];

  return (<>
    {orderToPrint && (<>
      <OrderData className='hidden print:block' order={orderToPrint} shipmentMethod={shipmentMethod} />
    </>)}

    <Layout>
      <div className="flex items-center justify-between w-full mb-4 print:hidden">
        <Input value={phrase} onChange={ev => setPhrase(ev.target.value)} placeholder='Search orders (number, address, customer name/email)' className="mr-4" />
        <Dropdown>
          <DropdownTrigger className="hidden sm:flex">
            <Button endContent={<FaChevronDown className="text-small" />} variant="flat">
              {tOrders('filter_by_status')}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Table Columns"
            closeOnSelect={false}
            selectedKeys={stateFilter}
            selectionMode="multiple"
            onSelectionChange={setStateFilter}
          >
            {stateOptions.map((state) => (
              <DropdownItem key={state.uid} className="capitalize">
                {tOrderStatuses(state.name)}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown> 
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <CustomTable items={filteredOrders} columns={columns} pagination={true} editFunc={onEdit} isEmailable={true} countries={countries}></CustomTable>
      )}
    </Layout>


    <Modal className="bg-background" isOpen={isOpen} onClose={onOpenChange} onOpenChange={onOpenChange} scrollBehavior='inside' size='4xl' isDismissable={false}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-1 ">Edit order<span className="text-primary">{editingOrder?.orderNo}</span></ModalHeader>
            <ModalBody>
              <div>
                <span className="text-textSecondary text-sm">{tOrders('shipment_status')}</span>
                <RadioGroup className="[&>div]:flex-row " value={orderState} onValueChange={setOrderState}>
                  <CustomRadio description={tOrderStatuses('processing_description')} value="processing">
                    {tOrderStatuses('processing')}
                  </CustomRadio>
                  <CustomRadio description={tOrderStatuses('packed_description')} value="packed">
                    {tOrderStatuses('packed')}
                  </CustomRadio>
                  <CustomRadio description={tOrderStatuses('shipped_description')} value="shipped">
                    {tOrderStatuses('shipped')}
                  </CustomRadio>
                </RadioGroup>
              </div>
              
              <div>
                <span className="text-textSecondary text-sm">{tOrders('payment_status')}</span>
                <RadioGroup className="[&>div]:flex-row" value={isOrderPaid} onValueChange={setIsOrderPaid}>
                  <CustomRadio description={tOrders('not_paid_description')} value={false}>
                    {tOrders('not_paid')}
                  </CustomRadio>
                  <CustomRadio description={tOrders('paid_description')} value={true}>
                    {tOrders('paid')}
                  </CustomRadio>
                </RadioGroup>
              </div>

              <OrderData order={editingOrder} shipmentMethod={shipmentMethod} orderState={orderState} isOrderPaid={isOrderPaid} />
            
            </ModalBody>
            <ModalFooter>
              {editingOrder && <>
                <Button className="mr-4 pr-2 group" variant="ghost" color="secondary" onClick={startManualPrint}> 
                  {tOrderButtons('print')}
                  <Kbd className="group-hover:bg-slate-100" keys={["command"]}>P</Kbd> 
                </Button>
                <Button className="mr-auto pr-2 group" variant="ghost" color="secondary" onClick={downloadPdf}>
                  {tOrderButtons('download_invoice')}
                  <Kbd className="group-hover:bg-slate-100" keys={["command"]}>S</Kbd>
                </Button>
              </>}
              <Button color="danger" variant="light" onPress={finishOrderEdit}>{tOrderButtons('cancel')}</Button>
              <Button color="primary" type="button" onPress={saveOrder}>{tOrderButtons('save')}</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  </>);
};

export async function getServerSideProps(context) {
  return {
    props:{
      messages: (await import(`@/locales/${context.locale}.json`)).default,
    }
  };
};