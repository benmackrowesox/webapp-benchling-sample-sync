import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { SampleName } from "./sample-name";

import type { Sample } from "src/types/order";

export interface MobileSampleSubmissionMetadata {
  helpText?: string;
  name: string;
  displayName: string;
  type:
    | "string"
    | "dateTime"
    | "boolean"
    | "number"
    | "singleSelect"
    | "multiSelect";
  units?: string | Array<string>;
  valueOptions?: string[];
  autofillValue?: any;
  value?: any;
}

export interface MobileSampleSubmissionSample {
  id: string;
  sampleName?: string;
  service?: string;
  removeSample?: (id: string) => void;
  metadata: MobileSampleSubmissionMetadata[];
}

interface MobileSampleSubmissionProps {
  samples?: MobileSampleSubmissionSample[];
  unsubmittedSampleIds: Array<{ sampleId: string; service: string }>;
  submittedSamples?: Sample[];
  newSample: () => MobileSampleSubmissionSample;
  saveForLater: (submissions: MobileSampleSubmissionSample[]) => Promise<void>;
  submit: (submissions: MobileSampleSubmissionSample[]) => Promise<void>;
}

const truncate = (s: string, len: number) => {
  return s.length < len ? s : `${s.substring(0, len - 3)}...`;
};

export const MobileSampleSubmission = (props: MobileSampleSubmissionProps) => {
  const {
    samples,
    submittedSamples,
    unsubmittedSampleIds,
    newSample,
    saveForLater,
    submit,
    ...other
  } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sampleSubmissions, setSampleSubmissions] = useState(samples ?? []);

  const getAvailableSamples = (
    currentToSubmit: MobileSampleSubmissionSample,
  ) => {
    return unsubmittedSampleIds.filter(
      (unsubmittedSample) =>
        unsubmittedSample.sampleId === currentToSubmit.sampleName ||
        !sampleSubmissions.find(
          (sampleSubmission) =>
            sampleSubmission.sampleName === unsubmittedSample.sampleId,
        ),
    );
  };

  const submitChanges = async () => {
    try {
      setIsSubmitting(true);
      await saveForLater(sampleSubmissions);
      await submit(sampleSubmissions);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const onSaveForLaterClicked = async () => {
    try {
      setIsSubmitting(true);
      await saveForLater(sampleSubmissions);
    } catch {
      // ?
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValue = (type: string) => {
    if (type == "dateTime") {
      return " ";
    } else if (type == "multiSelect") {
      return [];
    }
    return "";
  };

  const hasMeaningfulValue = (value: any) => {
    if (Array.isArray(value) && value.length == 0) {
      return false;
    }
    if (value == undefined || value == null) {
      return false;
    }
    return (value.toString() as string).trim() != "";
  };

  const metadataValueOfPreviousSample = (
    currentSampleIndex: number,
    metadataName: string,
    defaultValue: any,
  ) => {
    const value = sampleSubmissions[currentSampleIndex - 1].metadata?.find(
      (prevSampleMetadata) => prevSampleMetadata.name == metadataName,
    )?.value;

    return Array.isArray(value)
      ? [...value]
      : value?.toString() ?? defaultValue;
  };

  function toInputType(
    muiDataGridDataType: string,
  ): React.HTMLInputTypeAttribute | undefined {
    switch (muiDataGridDataType) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "dateTime":
        return "datetime-local";
      default:
        return undefined;
    }
  }

  function shouldDisableField(
    m: MobileSampleSubmissionMetadata,
    s: MobileSampleSubmissionSample,
  ) {
    return (
      (m.name == "taxonomicID" && s.service != "GenomeSequencing") ||
      (m.name == "qPCRPathogens" && s.service != "qPCR")
    );
  }

  return (
    <Box>
      <Box sx={{ marginBottom: 2 }}>
        {submittedSamples?.map((submittedSample) => (
          <SampleName key={submittedSample.name} name={submittedSample.name} />
        ))}
      </Box>
      <Stack spacing={2}>
        {sampleSubmissions.map((s, idx) => {
          const availableSamples = getAvailableSamples(s);
          return (
            <Accordion key={s.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Stack>
                  <Typography variant="h6">Sample {idx + 1}</Typography>
                  <Typography variant="body2">
                    {s.sampleName} - {s.service}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Box>
                    <FormControl sx={{ width: 200 }}>
                      <InputLabel id="sample-select-label">Sample</InputLabel>

                      <Select
                        id="sampleSelect"
                        labelId="sample-select-label"
                        label="Sample"
                        value={s.sampleName ?? ""}
                        onChange={(e) => {
                          const resetMetadataField = (
                            metadataField: string,
                            defaultValue: any,
                          ) => {
                            const singleServiceField = metadata.find(
                              (m) => m.name == metadataField,
                            );
                            if (singleServiceField) {
                              singleServiceField.value = defaultValue;
                            }
                          };
                          const sample = availableSamples.find(
                            (s) => s.sampleId == e.target.value,
                          );
                          const newSubmissions = [...sampleSubmissions];
                          const metadata = [...newSubmissions[idx].metadata];
                          if (sample?.service != "qPCR") {
                            resetMetadataField("qPCRPathogens", []);
                          }
                          if (sample?.service != "GenomeSequencing") {
                            resetMetadataField("taxonomicID", "");
                          }
                          newSubmissions[idx] = {
                            ...newSubmissions[idx],
                            sampleName: sample?.sampleId,
                            service: sample?.service,
                            metadata: metadata,
                          };
                          setSampleSubmissions(newSubmissions);
                        }}
                      >
                        {availableSamples.map((m) => (
                          <MenuItem key={m.sampleId} value={m.sampleId}>
                            <SampleName name={`${m.sampleId} - ${m.service}`} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      sx={{ alignSelf: "start", p: 0, float: "right" }}
                      onClick={() => {
                        const newSubmissions = [...sampleSubmissions];
                        newSubmissions.splice(idx, 1);
                        setSampleSubmissions(newSubmissions);
                      }}
                    >
                      Remove
                    </Button>
                  </Box>

                  {idx > 0 && (
                    <Button
                      sx={{ alignSelf: "start", p: "5px", pb: "0px" }}
                      onClick={() => {
                        const newSubmissions = [...sampleSubmissions];
                        newSubmissions[idx] = {
                          ...newSubmissions[idx],
                          metadata: newSubmissions[idx].metadata.map((m) => ({
                            ...m,
                            value:
                              hasMeaningfulValue(m.value) ||
                              shouldDisableField(m, s)
                                ? m.value
                                : metadataValueOfPreviousSample(
                                    idx,
                                    m.name,
                                    defaultValue(m.type),
                                  ),
                          })),
                        };
                        setSampleSubmissions(newSubmissions);
                      }}
                    >
                      Autofill all
                    </Button>
                  )}

                  {s.metadata.map((m, mIdx) => {
                    const autofillValue =
                      idx > 0 && !m.value
                        ? metadataValueOfPreviousSample(
                            idx,
                            m.name,
                            defaultValue(m.type),
                          )
                        : "";

                    const updateMetadata = (newValue: any) => {
                      const newSubmissions = [...sampleSubmissions];
                      const updatedMetadata = [...newSubmissions[idx].metadata];
                      updatedMetadata[mIdx] = {
                        ...updatedMetadata[mIdx],
                        value: newValue,
                      };
                      newSubmissions[idx] = {
                        ...newSubmissions[idx],
                        metadata: updatedMetadata,
                      };
                      setSampleSubmissions(newSubmissions);
                    };

                    const disableField = shouldDisableField(m, s);

                    return (
                      <Box
                        key={m.name}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {idx > 0 &&
                          hasMeaningfulValue(autofillValue) &&
                          !disableField && (
                            <Button
                              sx={{ alignSelf: "end", p: 0 }}
                              onClick={() => {
                                updateMetadata(autofillValue);
                              }}
                            >
                              {truncate(`Autofill: ${autofillValue}`, 30)}
                            </Button>
                          )}
                        <FormControl sx={{ width: "100%" }}>
                          {m.type == "string" ||
                          m.type == "number" ||
                          m.type == "dateTime" ? (
                            <TextField
                              disabled={disableField}
                              label={m.displayName}
                              type={toInputType(m.type)}
                              value={m.value ?? defaultValue(m.type)}
                              onChange={(e) => {
                                updateMetadata(e.target.value);
                              }}
                            />
                          ) : m.type == "singleSelect" ? (
                            <>
                              <InputLabel id={`${m.name}-select-label`}>
                                {m.displayName}
                              </InputLabel>

                              <Select
                                id={m.name}
                                labelId={`${m.name}-select-label`}
                                label={m.displayName}
                                value={m.value ?? ""}
                                onChange={(e) => {
                                  updateMetadata(e.target.value);
                                }}
                              >
                                {m.valueOptions?.map((v) => (
                                  <MenuItem key={v} value={v}>
                                    {v}
                                  </MenuItem>
                                ))}
                              </Select>
                            </>
                          ) : (
                            m.type == "multiSelect" && (
                              <Autocomplete
                                disabled={disableField}
                                multiple
                                options={m.valueOptions ?? []}
                                value={m.value || []}
                                onChange={(el, val) => updateMetadata(val)}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option}
                                renderOption={(props, option, { selected }) => (
                                  <li {...props}>
                                    <Checkbox
                                      icon={
                                        <CheckBoxOutlineBlankIcon fontSize="small" />
                                      }
                                      checkedIcon={
                                        <CheckBoxIcon fontSize="small" />
                                      }
                                      style={{ marginRight: 8 }}
                                      checked={selected}
                                    />
                                    {option}
                                  </li>
                                )}
                                style={{ width: "100%" }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label={m.displayName}
                                  />
                                )}
                              />
                            )
                          )}
                        </FormControl>
                      </Box>
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}

        <Button
          sx={{ alignSelf: "start" }}
          onClick={() =>
            setSampleSubmissions([...sampleSubmissions, props.newSample()])
          }
        >
          + Add another sample
        </Button>
      </Stack>

      <Box sx={{ mt: 5 }}>
        <LoadingButton
          loading={isSubmitting}
          variant="contained"
          onClick={() => submitChanges()}
          sx={{ mb: 5 }}
        >
          Submit
        </LoadingButton>
        <LoadingButton
          loading={isSubmitting}
          variant="contained"
          onClick={() => onSaveForLaterClicked()}
          sx={{ mb: 5, float: "right" }}
        >
          Save for later
        </LoadingButton>
      </Box>
    </Box>
  );
};
