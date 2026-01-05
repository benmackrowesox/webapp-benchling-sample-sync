import { Fragment } from "react";
import router from "next/router";
import { format } from "date-fns";
import type { Theme } from "@mui/material";
import _ from "lodash";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import type { NewOrder } from "../../../types/order";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import { AdminGuard } from "src/components/authentication/auth-guard";
import { SampleName } from "./sample-name";

import { Download } from "src/icons/download";

import { downloadFile } from "src/lib/client/firebase";

import { useTypedAuth } from "src/hooks/use-auth";
import { italicizeContentInBrackets } from "src/utils/text-formatting";

interface OrderDetailsProps {
  order: NewOrder;
}

const shouldItalicize = (key: string) => key === "livestock";

const toCapitalizedWords = (k: string) => {
  var words = k.match(/[A-Za-z][a-z]*/g) || [];

  return words.map(capitalize).join(" ");

  function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.substring(1);
  }
};

export const OrderSummary = (props: OrderDetailsProps) => {
  const { order, ...other } = props;
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const { user } = useTypedAuth();

  const readableAnswer = (
    response: { name: string; value: any },
    key: string,
  ) => {
    if (response.value) {
      return shouldItalicize(key)
        ? italicizeContentInBrackets(response.name)
        : response.name;
    }

    if (response.name == "Other") {
      return `Other: ${
        Array.isArray(response.value)
          ? `[${response.value.join(", ")}]`
          : response.value
      }`;
    }
    return `${response.name}: ${response.value}`;
  };

  const align = smDown ? "vertical" : "horizontal";

  const onClickManageReports = () => {
    if (!order) {
      return;
    }
    router.push(`/dashboard/orders/${order.id}/order-documents`);
  };

  return (
    <Stack spacing={2}>
      <Card key="basicInfoCard" {...other}>
        <CardHeader title="Basic info" />
        <Divider />
        <PropertyList>
          <AdminGuard>
            <PropertyListItem align={align} label="Customer">
              <Typography color="primary" variant="body2">
                {order.customer.name}
              </Typography>
              <Typography color="secondary" variant="body2">
                {order.customer.email}
              </Typography>
            </PropertyListItem>
            <Divider />
            <PropertyListItem align={align} label="Delivery Address">
              <Typography color="textSecondary" variant="body2">
                {order.deliveryAddress.name}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {order.deliveryAddress.line1}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {order.deliveryAddress.line2}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {order.deliveryAddress.townCity}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {order.deliveryAddress.postcode}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {order.deliveryAddress.county}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {order.deliveryAddress.country}
              </Typography>
            </PropertyListItem>
          </AdminGuard>
          <Divider />
          <PropertyListItem align={align} label="Title" value={order.title} />
          <Divider />
          <PropertyListItem align={align} label="ID" value={order.id} />
          <Divider />
          <PropertyListItem
            align={align}
            label="Date"
            value={format(order.createdAt, "dd/MM/yyyy HH:mm")}
          />
          <Divider />
          <PropertyListItem
            align={align}
            label="Status"
            value={toCapitalizedWords(order.status)}
          />
          <Divider />
        </PropertyList>
      </Card>
      <Card key="viewReportsCard">
        <CardHeader title="Order Reports" />
        <Divider />
        <CardContent sx={{ display: "flex", flexDirection: "column" }}>
          {order.orderReports?.map((report) => (
            <Box key={report.filename}>
              <span>
                <Link
                  href={report.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {report.filename}
                </Link>
              </span>

              {report.downloadUrl && (
                <IconButton
                  sx={{ pl: 3 }}
                  hidden={!report.downloadUrl}
                  aria-label="download report"
                  onClick={() => downloadFile(report.downloadUrl)}
                >
                  <Download />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            sx={{ marginLeft: "auto" }}
            variant="contained"
            onClick={onClickManageReports}
          >
            {user?.isAdmin ? "Manage documents" : "View all order documents"}
          </Button>
        </CardContent>
        <Divider />
      </Card>

      <Card key="proposalCard">
        <CardHeader title="Proposal" />
        <Divider />
        <CardContent>{order.proposal}</CardContent>
        <Divider />
      </Card>
      {order.orderedSamples && (
        <Card key="samplesCard">
          <CardHeader title="Samples" />
          <Divider />
          {_.chain(order.orderedSamples)
            .groupBy((s) => s.service)
            .map((samples, service) => (
              <Fragment key={service}>
                <PropertyListItem align={align} label={service}>
                  <>
                    {samples.map((x) => (
                      <SampleName key={x.name} name={x.name} />
                    ))}
                  </>
                </PropertyListItem>
                <Divider />
              </Fragment>
            ))
            .value()}
        </Card>
      )}
      <Card key="samplesRequestedCard">
        <CardHeader title="Samples Requested" />
        <Divider />
        <PropertyList key="propertyList">
          {order.requestedServices?.map((s, idx) => (
            <Fragment key={idx}>
              <PropertyListItem
                align={align}
                label={s.service}
                value={`${s.numberOfSamples} x ${s.sampleType}`}
                // ${s.hostSpecies ? "| " + s.hostSpecies : ""}
              />
              <Divider />
            </Fragment>
          ))}
        </PropertyList>
      </Card>
      <Card key="questionnaireResponsesCard">
        <>
          <CardHeader title="Questionnaire Responses" />
          <Divider />
          {order.questionnaireAnswers &&
            Object.keys(order.questionnaireAnswers).map((k) => (
              <Fragment key={k}>
                <PropertyListItem align={align} label={toCapitalizedWords(k)}>
                  <>
                    {order.questionnaireAnswers[k]
                      .filter(
                        (x) =>
                          x.value != undefined && (x.value as any) != false,
                      )
                      .map((x) => readableAnswer(x, k))
                      .map((x, idx) => (
                        <div key={idx}>{x}</div>
                      ))}
                  </>
                </PropertyListItem>
                <Divider />
              </Fragment>
            ))}
        </>
      </Card>
      <Card key="metadataFieldsCard">
        <CardHeader title="Metadata fields" />
        <Divider />
        <CardContent>
          {order.metadataFields &&
            order.metadataFields.map((m) => (
              <li key={m.displayName}>{m.displayName}</li>
            ))}
        </CardContent>
      </Card>
    </Stack>
  );
};
