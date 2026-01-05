import { Button, Container, Stack } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { ServiceItem, ServiceItemProps } from "./service-item";
import { useTypedAuth } from "src/hooks/use-auth";

export interface ServiceItemsProps {
  serviceItems: ServiceItemProps[];
  onAddServiceItem: () => void;
  onRemoveServiceItem: (id: string) => void;
  onUpdateServiceItem: (
    id: string,
    updatedServiceItem: ServiceItemProps,
  ) => void;
}

const checkHasError = (serviceItem: ServiceItemProps) => {
  return (
    serviceItem.service === "" ||
    serviceItem.sampleType === "" ||
    // serviceItem.hostSpecies === "" ||
    serviceItem.numberOfSamples === undefined ||
    serviceItem.numberOfSamples < 1
  );
};

const createNewServiceItem = () => {
  return {
    id: `service-${new Date().getTime()}`,
    service: "",
    sampleType: "",
    // hostSpecies: "",
    numberOfSamples: 1,
    displayError: false,
  };
};

export const useServiceItemsProvider = () => {
  const [serviceItems, setServiceItems] = useState<ServiceItemProps[]>([
    createNewServiceItem(),
  ]);

  const onAddServiceItem = () => {
    setServiceItems((serviceItems) => [
      ...serviceItems,
      createNewServiceItem(),
    ]);
  };

  const onRemoveServiceItem = (id: string) => {
    setServiceItems((serviceItems) =>
      serviceItems.filter((serviceItem) => serviceItem.id !== id),
    );
  };

  const onUpdateServiceItem = (
    id: string,
    updatedServiceItem: ServiceItemProps,
  ) => {
    setServiceItems((serviceItems) =>
      serviceItems.map((serviceItem) => {
        return serviceItem.id === id
          ? { ...updatedServiceItem }
          : { ...serviceItem };
      }),
    );
  };

  const onValidateServiceItems = () => {
    let hasError = serviceItems.some((serviceItem) =>
      checkHasError(serviceItem),
    );
    setServiceItems((serviceItems) =>
      serviceItems.map((serviceItem) => ({
        ...serviceItem,
        displayError: true,
      })),
    );

    return hasError;
  };

  const getOrderServiceItems = () => {
    return serviceItems.map((serviceItem) => ({
      service: serviceItem.service ?? "",
      sampleType: serviceItem.sampleType ?? "",
      // hostSpecies: serviceItem.hostSpecies ?? "",
      numberOfSamples: serviceItem.numberOfSamples ?? 1,
    }));
  };

  return {
    serviceItems,
    onAddServiceItem,
    onRemoveServiceItem,
    onValidateServiceItems,
    onUpdateServiceItem,
    getOrderServiceItems,
  };
};

export const ServiceItems: FC<ServiceItemsProps> = ({
  serviceItems,
  onAddServiceItem,
  onRemoveServiceItem,
  onUpdateServiceItem,
}) => {
  const { sendRequest } = useTypedAuth();

  const [dropdownOptions, setDropdownOptions] =
    useState<Record<string, string[]>>();

  useEffect(() => {
    async function fetchDropdownOptions() {
      if (!dropdownOptions) {
        const response = await sendRequest<void, Record<string, string[]>>(
          "/api/orders/request",
          "GET",
        );

        setDropdownOptions(response);
      }
    }
    if (!dropdownOptions) {
      fetchDropdownOptions().catch((error) => {
        console.error(error);
      });
    }
  }, [sendRequest, dropdownOptions]);

  return (
    <Container>
      <Stack direction="column" justifyContent="space-between" spacing={3}>
        {serviceItems.map((service, index) => (
          <ServiceItem
            {...service}
            index={index}
            key={service.id}
            id={service.id}
            serviceOptions={dropdownOptions?.services ?? []}
            sampleTypeOption={dropdownOptions?.sampleTypes ?? []}
            hostSpeciesOptions={dropdownOptions?.hostSpecies ?? []}
            onRemove={onRemoveServiceItem}
            onUpdate={onUpdateServiceItem}
          />
        ))}
        {dropdownOptions && (
          <Button sx={{ alignSelf: "start" }} onClick={onAddServiceItem}>
            + Add another sample
          </Button>
        )}
      </Stack>
    </Container>
  );
};
