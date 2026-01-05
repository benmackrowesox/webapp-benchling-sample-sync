import type {
  OrderedSample,
  Sample,
  SampleStatus,
  UnsubmittedSample,
} from "../../../types/order";
import {
  GridColDef,
  GridCellParams,
  GridRowId,
  GridValidRowModel,
  GridColTypeDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  SampleSubmissionMetadataField,
  SampleSubmissionTable,
} from "./sample-submission-table";
import { EditTextarea } from "./edit-text-area";
import { EditMultiSelect } from "./edit-multi-select";
import { Box } from "@mui/system";
import { Typography } from "@mui/material";
import {
  MobileSampleSubmission,
  MobileSampleSubmissionMetadata,
  MobileSampleSubmissionSample,
} from "./mobile-sample-submission";
import { SampleName } from "./sample-name";
import { SeverityPill } from "src/components/severity-pill";
import { sampleSeverityMap } from "./order-list-table";

interface SampleSubmissionTableWrapperProps {
  unsubmittedSamples?: UnsubmittedSample[];
  submittedSamples?: Sample[];
  orderedSamples: OrderedSample[];
  metadata: SampleSubmissionMetadataField[];
  isAdmin: boolean;
  saveUnsubmittedSamples: (
    unsubmittedSamples: UnsubmittedSample[],
    submittedSamples: Sample[],
  ) => Promise<void>;
  submitSamples: (sampleIds: string[]) => Promise<void>;
  isMobile: boolean;
}

const QPCR_PATHOGEN_DISEASE_REGEX =
  /^(.*?)(?:\s*\[([^\]]*)\])?(?:\s*\(([^\)]*)\))?$/;

const formatqPCRPathogens = (options: string[]) => {
  return options
    .map((option) => {
      const match = option.match(QPCR_PATHOGEN_DISEASE_REGEX);

      if (match) {
        const part1 = match[1]; // "something"
        const part2 = match[2]; // "in square brackets" (common name)
        const part3 = match[3]; // "in round brackets" (acronym)

        console.log(part1, part2, part3);
        return `${part2 ?? part1} ${part3 ? "(" + part3 + ")" : ""} ${
          part2 ? " - " + part1 : ""
        }`;
      } else {
        return option;
      }
    })
    .sort();
};

export const SampleSubmissionTableWrapper = (
  props: SampleSubmissionTableWrapperProps,
) => {
  const {
    unsubmittedSamples,
    submittedSamples,
    orderedSamples,
    metadata,
    isAdmin,
    saveUnsubmittedSamples,
    submitSamples,
    isMobile,
    ...other
  } = props;

  const samples: (UnsubmittedSample | Sample)[] = [
    ...(submittedSamples ?? []),
    ...(unsubmittedSamples ?? []),
  ];

  const metadataOnOrder = metadata
    .filter((m) => m.displayOnOrder)
    .sort((a, b) => a.displayIndex - b.displayIndex);

  const cellClassName = (params: GridCellParams<any, any>): string => {
    if (params.isEditable) {
      return "";
    } else {
      return "uneditable";
    }
  };

  const renderStatusCell = (params: any): JSX.Element => {
    function displayText(status?: string) {
      switch (status) {
        case "":
        case undefined:
        case "sample-collected":
          return "Collecting";
        case "sample-returned":
          return "Returned";
        case "processing":
          return "Processing";
        case "complete":
          return "Complete";
      }
    }
    return (
      <SeverityPill color={sampleSeverityMap[params.value] ?? "warning"}>
        {displayText(params.value)}
      </SeverityPill>
    );
  };

  const buildColumns = (): GridColDef[] => {
    const standardColumns = [
      {
        field: "sampleId",
        headerName: "Sample",
        width: 120,
        editable: true,

        cellClassName: cellClassName,
        type: "singleSelect",
        renderCell: (params: any) => <SampleName name={params.value} />,
        getOptionLabel: (value: any) =>
          value ? <SampleName name={value} /> : "<None>",
      },
      {
        field: "service",
        headerName: "Service",
        width: 200,
        editable: true,
        cellClassName: cellClassName,
        type: "singleSelect",
        valueOptions: [...new Set(orderedSamples.map((s) => s.service))],
      },
      {
        field: "sampleStatus",
        headerName: "Status",
        width: 120,
        editable: isAdmin,
        renderCell: renderStatusCell,
        type: "singleSelect",
        valueOptions: [
          "sample-collected",
          "sample-returned",
          "processing",
          "complete",
        ],
      },
    ];

    const metadataColumns = metadataOnOrder.map<GridColDef>((m) => {
      const colDef: any = {
        field: m.name,
        headerName: toHeaderName(m.displayName, m.units),
        width: m.gridColumnWidth,
        type: m.type,
        valueOptions:
          m.name === "qPCRPathogens" && m.valueOptions
            ? formatqPCRPathogens(m.valueOptions)
            : m.valueOptions,
        cellClassName: cellClassName,
        editable: true,
        ...specialRenderForField(m.name, m.type),
      };

      return colDef;
    });
    console.log("metadataOnOrder", metadataColumns);

    return [...standardColumns, ...metadataColumns];
  };

  const data: { columns: GridColDef[]; rows: any } = {
    columns: buildColumns(),
    rows: samples.map((s, idx) => {
      const row: any = {
        id: idx,
        sampleId: s.name,
        service: s.service,
        sampleStatus: "status" in s ? s.status : "",
        editable:
          isAdmin ||
          ("status" in s ? s.status == "sample-collected" || !s.status : true),
      };
      const getValue = (rawValue: any, type: string) => {
        if (type == "dateTime") {
          return rawValue && new Date(rawValue);
        } else {
          return rawValue ?? "";
        }
      };
      for (const f in metadataOnOrder) {
        const metadataField = metadataOnOrder[f];
        row[metadataField.name] = getValue(
          s.metadata[metadataField.name],
          metadataField.type,
        );
      }

      return row;
    }),
  };

  const fieldInfo: Record<string, React.ReactElement> = {};

  const toSamples = (
    rows: Map<GridRowId, GridValidRowModel>,
  ): {
    submittedSamples: Sample[];
    unsubmittedSamples: UnsubmittedSample[];
  } => {
    const unsubmittedSamples: UnsubmittedSample[] = [];
    const submittedSamples: Sample[] = [];

    Array.from(rows.values()).forEach((row) => {
      const { id, sampleId, service, sampleStatus, reportUrl, ...metadata } =
        row;
      const status: SampleStatus | undefined = row.sampleStatus;
      if (!sampleId || !service) {
        return;
      }
      if (isAdmin && status && status != "sample-collected") {
        const s: Sample = {
          name: sampleId,
          service: service,
          status: sampleStatus,
          metadata: metadata,
          reportUrl: reportUrl,
          lastUpdated: Date.now(),
        };
        submittedSamples.push(s);
      } else if (!status || status == "sample-collected") {
        const s: UnsubmittedSample = {
          name: sampleId,
          service: service,
          metadata: metadata,
        };
        unsubmittedSamples.push(s);
      } else {
        // ignore!
      }
    });

    return { unsubmittedSamples, submittedSamples };
  };

  for (const x in metadata) {
    const metadataField = metadata[x];
    fieldInfo[metadataField.name] = (
      <Box>
        <Typography variant="h5">{metadataField.displayName}</Typography>
        <Typography variant="body2">
          {metadataField.helpText || `This is a ${metadataField.type} field.`}
        </Typography>
      </Box>
    );
  }

  return isMobile ? (
    <MobileSampleSubmission
      samples={unsubmittedSamples?.map<MobileSampleSubmissionSample>(
        (s, idx) => {
          return {
            id: s.name,
            num: idx,
            service: s.service,
            sampleName: s.name,
            metadata: metadataOnOrder.map<MobileSampleSubmissionMetadata>(
              (m) => {
                const metadataValue = s.metadata[m.name];
                return {
                  displayName: m.displayName,
                  name: m.name,
                  value: metadataValue,
                  units: m.units,
                  valueOptions: m.valueOptions,
                  type: m.type,
                  helpText: m.helpText,
                };
              },
            ),
          };
        },
      )}
      submittedSamples={submittedSamples}
      unsubmittedSampleIds={orderedSamples
        .filter((s) => !submittedSamples?.find((ss) => ss.name == s.name))
        .map((s) => ({ sampleId: s.name, service: s.service }))}
      saveForLater={async (changes) => {
        const unsubmittedSamples = changes
          .filter((c) => c.sampleName && c.service)
          .map((c) => {
            const m: Record<string, any> = {};
            for (const q in c.metadata) {
              m[c.metadata[q].name] = c.metadata[q].value;
            }
            return {
              name: c.sampleName!,
              service: c.service!,
              metadata: m,
            };
          });
        await saveUnsubmittedSamples(
          unsubmittedSamples,
          submittedSamples ?? [],
        );
      }}
      submit={async (changes) => {
        const sampleIds = changes
          .filter((r) => r.sampleName)
          .map((r) => r.sampleName!);
        await submitSamples(sampleIds);
      }}
      newSample={() => ({
        id: Date.now().toString(),
        metadata: metadataOnOrder,
      })}
    />
  ) : (
    <SampleSubmissionTable
      columns={data.columns}
      rows={data.rows}
      allMetadataFields={metadataOnOrder}
      availableSampleIds={orderedSamples.map((s) => ({
        sampleId: s.name,
        service: s.service,
      }))}
      usedSampleIds={(submittedSamples?.map((s) => s.name) ?? []).concat(
        unsubmittedSamples?.map((s) => s.name) ?? [],
      )}
      fieldInfo={fieldInfo}
      saveForLater={async (changes) => {
        const { unsubmittedSamples, submittedSamples } = toSamples(changes);
        await saveUnsubmittedSamples(unsubmittedSamples, submittedSamples);
      }}
      submit={async (rows) => {
        const sampleIds = rows.map((r) => r.sampleId);
        await submitSamples(sampleIds);
      }}
    />
  );
};
function toHeaderName(
  displayName: string,
  units: string | string[] | undefined,
): string {
  if (!units) {
    return displayName;
  }
  if (Array.isArray(units)) {
    return `${displayName} (${units.join(" or ")})`;
  } else {
    return `${displayName} (${units})`;
  }
}
function specialRenderForField(
  name: string,
  type: string,
): {
  renderEditCell?: (params: any) => React.ReactNode;
  renderCell?: (params: any) => React.ReactNode;
} {
  const multiSelectColumnType: GridColTypeDef<string[]> = {
    renderCell: (params) => <MultiSelectCell {...params} />,
    renderEditCell: (params) => <EditMultiSelect {...params} />,
  };
  if (type == "multiSelect") {
    return multiSelectColumnType;
  } else if (name == "notes") {
    return { renderEditCell: (params) => <EditTextarea {...params} /> };
  }
  return {};
}

const MultiSelectCell = (props: GridRenderCellParams) => {
  if (!props.value || props.value.length == 0) {
    return "";
  }
  if (props.value.length == 1) {
    return props.value[0];
  } else {
    return `${props.value.length} selected`;
  }
};
