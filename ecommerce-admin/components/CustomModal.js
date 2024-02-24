import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useTranslations } from "next-intl";

export default function CustomModal({size='5xl',isOpen,onOpenChange,providedBody,toDelete,toEdit,title,entity,clearFunc,deleteFunc,deprecateFunc,saveFunc,isDeprecatable,disableCondition}) {
  const tModal = useTranslations('Modal');
  const tModalButtons = useTranslations('Buttons');
  
  return (
    <Modal className="bg-background" isOpen={isOpen} onClose={onOpenChange} backdrop={"blur"} onOpenChange={onOpenChange} scrollBehavior='inside' size={size} isDismissable={false}>
      <ModalContent>
        {(onClose) => (
          <>
            {toEdit ? (
              <ModalHeader className="flex gap-1">{tModal('edit')} <span className="text-primary">{title}</span></ModalHeader>
            ) : (
              <ModalHeader className="flex flex-col gap-1">
                 {toDelete && isDeprecatable && (<>
                  <div>{tModal('deprecate')} <span className="text-warning">{title}</span></div>
                </>)}
                {toDelete && !isDeprecatable &&(
                  <div>{tModal('delete')} <span className="text-danger">{title}</span></div>
                )}
                {!toDelete && !isDeprecatable && (
                  <div>{tModal('add_new', {name: entity})}</div>
                )}
              </ModalHeader>
            )}
            <ModalBody>
              {providedBody}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onClick={clearFunc}>{tModalButtons('cancel')}</Button>

              {toDelete && !isDeprecatable && (
                <Button color="danger" type="button" onClick={deleteFunc}>
                <a onClick={onClose}>{tModalButtons('delete')}</a>
              </Button>
              )}
              {toDelete && isDeprecatable && (
                <Button color="warning" type="button" onClick={deprecateFunc}>
                  <a onClick={onClose}>{tModalButtons('deprecate')}</a>
                </Button>
              )}
              {!toDelete && !isDeprecatable && (
                <Button isDisabled={disableCondition} color="primary" onClick={saveFunc}>{tModalButtons('save')}</Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};