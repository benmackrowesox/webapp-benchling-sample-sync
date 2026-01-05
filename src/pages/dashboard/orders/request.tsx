import { ChangeEvent, useEffect, useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { useTypedAuth } from "src/hooks/use-auth";

import {
  AuthGuard,
  ApprovedUserGuard,
} from "src/components/authentication/auth-guard";
import {
  ServiceItems,
  useServiceItemsProvider,
} from "src/components/dashboard/order/service-items";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { QuestionnaireCard } from "src/components/questionnaire-card";
import { EditAddressCard } from "src/components/dashboard/order/edit-address-card";
import { UserSelect } from "src/components/dashboard/user/user-select";
import { PageHelpSection } from "src/components/dashboard/page-help-section";

import { getUserDetails } from "src/lib/client/firebase";
import { sendEmail, EMAILJS_TEMPLATES } from "src/lib/client/emailjs";
import { gtm } from "src/lib/client/gtm";

import { Address } from "src/types/user";
import { OrderRequest } from "src/types/order";

type AnswerSet = { name: string; value: any }[];

interface OrderRequestState {
  userId?: string;
  title: string;
  proposal: string;
  dropdownOptions?: Record<string, AnswerSet>;
  currentPage: number;
}

const formatDeliveryAddress = (deliveryAddress: Address) => {
  return [
    deliveryAddress.name,
    deliveryAddress.line1,
    deliveryAddress.line2,
    deliveryAddress.postcode,
    deliveryAddress.townCity,
    deliveryAddress.county,
    deliveryAddress.country,
  ]
    .filter((chunk) => (chunk as any as string)?.trim().length > 0)
    .join(", ");
};

const Page: NextPage = () => {
  const router = useRouter();
  const { user, sendRequest } = useTypedAuth();

  const [loading, setLoading] = useState(false);
  const [{ userId, title, proposal, dropdownOptions, currentPage }, setState] =
    useState<OrderRequestState>({
      userId: (router.query.userId as string) ?? user?.id,
      title: "",
      proposal: "",
      currentPage: 1,
    });
  const [hasTitleError, setHasTitleError] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState<Address>();
  const [firstName, setFirstName] = useState<string>();
  const serviceItemsProvider = useServiceItemsProvider();

  useEffect(() => {
    gtm.push({ event: "page_view" });

    async function fetchDropdownOptions(): Promise<Record<string, string[]>> {
      const response = await sendRequest<void, Record<string, string[]>>(
        "/api/customer-options/request-page",
        "GET",
      );

      return response;
    }

    function setDropdownOptions(
      response: Record<string, string[]>,
      answers?: Record<string, AnswerSet>,
    ) {
      if (!dropdownOptions) {
        setState((prevState) => {
          const opts: Record<string, { name: string; value: any }[]> = {};
          for (let key in response) {
            if (
              key == "services" ||
              key == "sampleTypes"
              // ||key === "hostSpecies"
            ) {
              // handled separately. Hack to not make an empty 'services', 'sampleTypes' and 'hostSpecies'
              // response appear in order summary.
              continue;
            }
            opts[key] = response[key].map((n) => ({
              name: n,
              value: answers?.[key]?.find((a) => a.name == n)?.value,
            }));
          }
          return {
            ...prevState,
            dropdownOptions: opts,
          };
        });
      }
    }

    if (!dropdownOptions) {
      fetchDropdownOptions()
        .then(async (res) => {
          setDropdownOptions(res);
        })
        .catch((error) => console.error(error));
    }
  }, []);

  useEffect(() => {
    getUserDetails(userId).then((ud) => {
      setFirstName(ud.firstName);
      setDeliveryAddress({
        name: `${ud.firstName ?? ""} ${ud.lastName ?? ""}`,
        line1: ud.line1 ?? "",
        line2: ud.line2 ?? "",
        townCity: ud.townCity ?? "",
        county: ud.county ?? "",
        country: ud.country ?? "",
        postcode: ud.postcode ?? "",
      });
    });
  }, [userId]);

  const submit = async () => {
    try {
      const hasError = serviceItemsProvider.onValidateServiceItems();
      if (hasError || !userId) {
        return;
      }

      const sanitisedServiceItems = serviceItemsProvider.serviceItems.map(
        (serviceItem) => ({
          id: serviceItem.id,
          service: serviceItem.service,
          sampleType: serviceItem.sampleType,
          // hostSpecies: serviceItem.hostSpecies,
          numberOfSamples: serviceItem.numberOfSamples,
        }),
      );

      const orderRequest: OrderRequest = {
        userId: userId,
        title: title,
        proposal: proposal,
        questionnaireAnswers: dropdownOptions!,
        services: sanitisedServiceItems,
        deliveryAddress: deliveryAddress!,
      };
      const response = await sendRequest<
        OrderRequest,
        { orderNumber: string; email: string }
      >("/api/orders/request", "POST", orderRequest);

      await sendEmail(EMAILJS_TEMPLATES.ORDER_STATUS_CHANGED, {
        subject: "New order placed",
        customer_name: firstName,
        customer_email: response.email,
        order_id: response.orderNumber,
        new_order: true,
        order_status: "new order",
        order_title: title,
        order_delivery_address: formatDeliveryAddress(deliveryAddress!),
      });

      toast.success(`Order created: ${response.orderNumber}`);
      router.push("/dashboard/orders");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChange = (
    option: string,
    event: any,
    mutuallyExclusive?: boolean,
  ) => {
    const getTargetValue = (target: any): string => {
      switch (target.type) {
        case "text":
          return target.value;
        case "radio":
          return target.value;
        default:
          return target.checked;
      }
    };
    setState((prevState) => {
      const opts = prevState.dropdownOptions![option];
      if (mutuallyExclusive) {
        opts.forEach((opt) => {
          opt.value =
            opt.name == event.target.name
              ? getTargetValue(event.target)
              : undefined;
        });
      } else {
        let opt = prevState.dropdownOptions![option]!.find(
          (x) => x.name == event.target.name,
        );

        if (opt) {
          opt.value = getTargetValue(event.target);
        }
      }

      return {
        ...prevState,
      };
    });
  };

  const handleToggle = (option: string, event: any) => {
    const currentVal = dropdownOptions![option]!.filter(
      (x) => x.name == (event.target as HTMLButtonElement).name,
    )[0];
    if (currentVal.value === (event.target as HTMLButtonElement).value) {
      currentVal.value = "";
    } else {
      currentVal.value = (event.target as HTMLButtonElement).value;
    }
    setState((prevState) => ({
      ...prevState,
      dropdownOptions: dropdownOptions,
    }));
  };

  const getHelpText = (pageNum: number) => {
    switch (pageNum) {
      case 1:
        return (
          <>
            {`Before you begin your project, please start by giving us a high level overview of
           the work you are doing and why. If you are unsure about the best approach to take,
          let us know here and we will get in touch to discuss the best options.`}
            <br />
            {`If you already know the type of service you need and the number of samples you wish to process,
          please enter the information and we can begin to structure the project in the following pages.`}
          </>
        );
      case 2:
        return (
          <>{`Please provide as much information as possible so that we can tailor
        our service to fit your requirements and ensure that you have the infrastructure
        required for sample collection and successful analysis.`}</>
        );
      case 3:
        return (
          <>
            {`Please provide a delivery address so that our collection kit can be posted
            as soon as the order is approved.`}
            <br />
            {`When you are ready, please submit your proposal for approval. If there are
            any concerns, we will reach out right away.`}
          </>
        );
    }
  };

  const hasPageError = () => {
    const hasError = serviceItemsProvider.onValidateServiceItems();
    const hasTitleError = currentPage === 1 && title.length < 1;
    const hasUserIdError = currentPage === 1 && !userId;
    setHasTitleError(hasTitleError);
    const withError = hasError || hasTitleError || hasUserIdError;
    if (withError) {
      toast.error(`Please fill in all required fields.`);
    }
    return withError;
  };

  const onClickPrevious = () => {
    window.scrollTo({ top: 0 });
    setState((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage - 1,
    }));
  };

  const onClickNext = () => {
    if (hasPageError()) {
      return;
    }
    window.scrollTo({ top: 0 });
    setState((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage + 1,
    }));
  };

  const onClickPageNumber = (e: ChangeEvent<unknown>, page: number) => {
    if (hasPageError()) {
      return;
    }
    window.scrollTo({ top: 0 });
    setState((prevState) => ({
      ...prevState,
      currentPage: page,
    }));
  };

  return (
    <>
      <Head>
        <title>Proposal / Order Request | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4}>
            <Typography variant="h4">Proposal / Order Request</Typography>
            <PageHelpSection>{getHelpText(currentPage)}</PageHelpSection>
            {dropdownOptions && (
              <Stack spacing={3}>
                {currentPage === 1 && (
                  <>
                    <UserSelect
                      userId={userId}
                      onSelectUser={(newUserId: string) =>
                        setState((prevState) => ({
                          ...prevState,
                          userId: newUserId,
                        }))
                      }
                    />
                    <Card>
                      <CardContent>
                        <Typography variant="h6">Title*</Typography>
                        <Box
                          sx={{
                            display: "flex",
                            mt: 2,
                            alignItems: "center",
                          }}
                        >
                          <TextField
                            sx={{ flexGrow: 1 }}
                            minRows={1}
                            placeholder="Please provide a title for the proposed work."
                            multiline={true}
                            value={title}
                            error={hasTitleError && title.length < 1}
                            helperText="Required"
                            onChange={(e) =>
                              setState((prevState) => ({
                                ...prevState,
                                title: e.target.value,
                              }))
                            }
                          ></TextField>
                        </Box>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">Description</Typography>
                        <Box
                          sx={{
                            display: "flex",
                            mt: 2,
                            alignItems: "center",
                          }}
                        >
                          <TextField
                            sx={{ flexGrow: 1 }}
                            minRows={5}
                            placeholder="Please provide an overview description of the proposed work."
                            multiline={true}
                            value={proposal}
                            onChange={(e) =>
                              setState((prevState) => ({
                                ...prevState,
                                proposal: e.target.value,
                              }))
                            }
                          ></TextField>
                        </Box>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">Sample Information</Typography>
                        <Box
                          sx={{
                            display: "flex",
                            mt: 2,
                            alignItems: "center",
                          }}
                        >
                          <ServiceItems
                            serviceItems={serviceItemsProvider.serviceItems}
                            onAddServiceItem={
                              serviceItemsProvider.onAddServiceItem
                            }
                            onRemoveServiceItem={
                              serviceItemsProvider.onRemoveServiceItem
                            }
                            onUpdateServiceItem={
                              serviceItemsProvider.onUpdateServiceItem
                            }
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </>
                )}
                {currentPage === 2 && (
                  <>
                    <QuestionnaireCard
                      options={dropdownOptions.dataOutcomes}
                      optionsType="checkbox"
                      question="What data outcomes are important to you?"
                      onChange={(e) => handleChange("dataOutcomes", e)}
                    />
                    <QuestionnaireCard
                      options={dropdownOptions.projectOutcomes}
                      optionsType="checkbox"
                      question="What project outcomes are important to you?"
                      onChange={(e) => handleChange("projectOutcomes", e)}
                    />
                  </>
                )}
                {currentPage === 3 && deliveryAddress && (
                  <EditAddressCard
                    address={deliveryAddress}
                    updateAddress={(address) => setDeliveryAddress(address)}
                  />
                )}
                <Box
                  sx={{
                    display: "flex",
                    maxWidth: "100%",
                    alignSelf: "center",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {currentPage !== 1 && (
                      <Button
                        sx={{ alignSelf: "start" }}
                        variant="contained"
                        onClick={onClickPrevious}
                        hidden={currentPage === 1}
                      >
                        Previous
                      </Button>
                    )}
                  </div>
                  <Pagination
                    sx={{ display: { sm: "block", xs: "none" } }}
                    hideNextButton
                    hidePrevButton
                    count={3}
                    page={currentPage}
                    onChange={onClickPageNumber}
                  />
                  {currentPage !== 3 ? (
                    <Button
                      sx={{ alignSelf: "end" }}
                      variant="contained"
                      onClick={onClickNext}
                    >
                      Next
                    </Button>
                  ) : (
                    <LoadingButton
                      sx={{ alignSelf: "end" }}
                      variant="contained"
                      loading={loading}
                      onClick={async (a) => {
                        setLoading(true);
                        await submit();
                        setLoading(false);
                      }}
                    >
                      Submit
                    </LoadingButton>
                  )}
                </Box>
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <AuthGuard>
    <ApprovedUserGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </ApprovedUserGuard>
  </AuthGuard>
);

export default Page;
