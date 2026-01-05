import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { useTypedAuth } from "src/hooks/use-auth";

import { MainLayout } from "src/components/main-layout";
import { QuestionnaireCard } from "src/components/questionnaire-card";
import { AdminGuard } from "src/components/authentication/auth-guard";
import { PageHelpSection } from "src/components/dashboard/page-help-section";

import { gtm } from "../lib/client/gtm";
import { sendEmail, EMAILJS_TEMPLATES } from "src/lib/client/emailjs";

interface NewCustomerQuestionnaireState {
  isCompleted?: boolean;
  dropdownOptions?: Record<string, AnswerSet>;
  isLoading: boolean;
}

type AnswerSet = { name: string; value: any }[];

const NewCustomerQuestionnaire: NextPage = () => {
  const [{ isCompleted, isLoading, dropdownOptions }, setState] =
    useState<NewCustomerQuestionnaireState>({
      isCompleted: undefined,
      isLoading: false,
    });

  const { user, sendRequest } = useTypedAuth();
  const router = useRouter();

  const getUserId = () => {
    if (user?.isAdmin) {
      const params = new URL(window.location.href).searchParams;
      return params.get("userId") ?? user?.id;
    } else {
      return user?.id;
    }
  };

  useEffect(() => {
    gtm.push({ event: "page_view" });

    async function fetchDropdownOptions(): Promise<Record<string, string[]>> {
      const response = await sendRequest<void, Record<string, string[]>>(
        "/api/customer-options/new-user-questionnaire",
        "GET",
      );

      return response;
    }

    function fetchUserAnswers(): Promise<Record<string, AnswerSet>> {
      const userId = getUserId();

      const url = `/api/users/${userId}/new-user-questionnaire`;
      const response = sendRequest<void, Record<string, AnswerSet>>(
        url,
        "GET",
      ).catch((error) => {
        return Promise.resolve<Record<string, AnswerSet>>({});
      });

      return response;
    }

    function setDropdownOptions(
      response: Record<string, string[]>,
      answers?: Record<string, AnswerSet>,
    ) {
      if (!dropdownOptions) {
        const isCompleted = !!answers && Object.keys(answers).length > 0;
        setState((prevState) => {
          const opts: Record<string, { name: string; value: any }[]> = {};
          for (let key in response) {
            opts[key] = response[key].map((n) => ({
              name: n,
              value: answers?.[key]?.find((a) => a.name == n)?.value,
            }));
          }
          return {
            ...prevState,
            isCompleted: isCompleted,
            dropdownOptions: opts,
          };
        });
      }
    }

    if (!dropdownOptions) {
      Promise.all([fetchUserAnswers(), fetchDropdownOptions()])
        .then((res) => {
          setDropdownOptions(res[1], res[0]);
        })
        .catch((error) => console.error(error));
    }
  }, []);

  const submit = async () => {
    await sendRequest<Record<string, { name: string; value: string }[]>, void>(
      `/api/users/${user?.id}/new-user-questionnaire`,
      "POST",
      dropdownOptions!,
    );
    if (!isCompleted) {
      await sendEmail(EMAILJS_TEMPLATES.NEW_USER, {});
    }
    router.push(`/dashboard/account`);
  };

  const handleChange = (option: string, event: any) => {
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
      let opt = prevState.dropdownOptions![option]!.find(
        (x) => x.name == event.target.name,
      );
      if (opt) {
        opt.value = getTargetValue(event.target);
      }
      return {
        ...prevState,
      };
    });
  };

  const approveUser = async (userId?: string) => {
    if (userId) {
      await sendRequest(`/api/users/${userId}/approve`, "POST");
      router.push("/dashboard/approve-users");
    }
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

  const onClickSubmit = async (a: any) => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true,
    }));
    try {
      await submit();
    } catch {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
    }
  };

  return (
    <>
      <Head>
        <title>
          {isCompleted ? "Review Questionnaire" : "New Customer Questionnaire"}{" "}
          | Esox Biologics
        </title>
        <meta
          property="og:title"
          content="New Customer Questionnaire | Esox Biologics"
          key="title"
        />
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography sx={{ mt: 3, mb: 2 }} variant="h4">
            {typeof isCompleted !== "boolean" ? (
              <></>
            ) : isCompleted ? (
              "Review Questionnaire"
            ) : (
              "New Customer Questionnaire"
            )}
          </Typography>
          {dropdownOptions && (
            <Box sx={{ display: { sm: "block" } }}>
              {isCompleted ? (
                <Box
                  sx={(theme) => ({
                    borderRadius: 1,
                    backgroundColor: theme.palette.success.light,
                    opacity: 0.8,
                    mb: 3,
                    padding: 1,
                    display: "flex",
                    alignItems: "center",
                  })}
                >
                  <AdminGuard
                    guardFailedChildren={
                      <Typography variant="subtitle1">
                        {`Thanks for registering! Your account is pending approval. Feel free to edit your responses, below.`}
                      </Typography>
                    }
                  >
                    <LoadingButton
                      sx={{ width: "100%" }}
                      variant="contained"
                      onClick={() => approveUser(getUserId())}
                    >
                      Approve
                    </LoadingButton>
                  </AdminGuard>
                </Box>
              ) : (
                <PageHelpSection>
                  {
                    "Please provide as much information as possible so that we can customise our service to fit your requirements."
                  }
                </PageHelpSection>
              )}
              <Stack spacing={4}>
                <QuestionnaireCard
                  question="Which diagnostic services do you currently use or are
                  interested in?"
                  questionTitle="Diagnostics services"
                  options={dropdownOptions.services}
                  optionsType="checkbox"
                  onChange={(e) => handleChange("services", e)}
                />

                <QuestionnaireCard
                  question="Which sample types do you send for diagnostics and at which
                    frequency?"
                  questionTitle="Diagnostics frequency"
                  options={dropdownOptions.sampleTypes}
                  onChange={(e) => handleToggle("sampleTypes", e)}
                  optionsType="radio"
                  choices={["Daily", "Weekly", "Monthly"]}
                />

                <QuestionnaireCard
                  question="What are your major health concerns?"
                  options={dropdownOptions.healthConcerns}
                  questionTitle="Health concerns"
                  optionsType="checkbox"
                  onChange={(e) => handleChange("healthConcerns", e)}
                />

                <QuestionnaireCard
                  question="What species do you work with?"
                  options={dropdownOptions.species}
                  questionTitle="Livestock"
                  hasLatinInBrackets={true}
                  optionsType="checkbox"
                  onChange={(e) => handleChange("species", e)}
                />

                <QuestionnaireCard
                  options={dropdownOptions.waterQuality}
                  optionsType="checkbox"
                  question="Which of the following parameters do you / can you measure?"
                  questionTitle="Water Quality"
                  onChange={(e) => handleChange("waterQuality", e)}
                />
                <QuestionnaireCard
                  options={dropdownOptions.husbandry}
                  optionsType="checkbox"
                  question="Which of the following parameters do you / can you record?"
                  questionTitle="Husbandry"
                  onChange={(e) => handleChange("husbandry", e)}
                />
                <QuestionnaireCard
                  options={dropdownOptions.environmental}
                  optionsType="checkbox"
                  question="Which of these parameters do you / can you record based on the type of system?"
                  questionTitle="Environmental"
                  onChange={(e) => handleChange("environmental", e)}
                />

                <QuestionnaireCard
                  options={dropdownOptions.productionEnvironments}
                  optionsType="radio"
                  choices={["Saline", "Fresh", "Brackish"]}
                  question="What type of production environments do you interact with?"
                  questionTitle="Production environment"
                  onChange={(e) => handleToggle("productionEnvironments", e)}
                />

                <QuestionnaireCard
                  options={dropdownOptions.systemPreparation}
                  optionsType="checkbox"
                  question="If you work with internal environments, which sterilisation methods do you use?"
                  questionTitle="System Preparation"
                  onChange={(e) => handleChange("systemPreparation", e)}
                />

                <QuestionnaireCard
                  options={dropdownOptions.dataStorage}
                  optionsType="checkbox"
                  questionTitle="Data Storage"
                  question="In which format is your data stored?"
                  onChange={(e) => handleChange("dataStorage", e)}
                />

                <QuestionnaireCard
                  options={dropdownOptions.facilities}
                  optionsType="checkbox"
                  questionTitle="Facilities"
                  question="Which equipment do you have in house?"
                  onChange={(e) => handleChange("facilities", e)}
                />
                <QuestionnaireCard
                  options={dropdownOptions.furtherInformation}
                  optionsType="radio"
                  questionTitle="Further Information"
                  question="Can you provide us with your production system location / layout / design?"
                  choices={["Yes", "No", "Maybe"]}
                  onChange={(e) => handleChange("furtherInformation", e)}
                />

                <QuestionnaireCard
                  question="What data outcomes are important to you?"
                  questionTitle="Outcome"
                  onChange={(e) => handleChange("dataOutcomes", e)}
                  options={dropdownOptions.dataOutcomes}
                  optionsType="checkbox"
                />

                <LoadingButton
                  variant="contained"
                  loading={isLoading}
                  onClick={onClickSubmit}
                >
                  Submit
                </LoadingButton>
              </Stack>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

NewCustomerQuestionnaire.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default NewCustomerQuestionnaire;
