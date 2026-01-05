import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

import { Box, Stack } from "@mui/system";
import { FC, useState, useMemo } from "react";
import { OrderServiceItem } from "src/types/order";
import NumberInput from "src/components/shared/NumberInput";

export interface ServiceItemProps extends OrderServiceItem {
  id: string;
  displayError: boolean;
}

interface ServiceItemComponentProps extends ServiceItemProps {
  index: number;
  serviceOptions: string[];
  sampleTypeOption: string[];
  hostSpeciesOptions: string[];
  id: string;
  service: string;
  sampleType: string;
  // hostSpecies: string;
  numberOfSamples: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updatedServiceItem: ServiceItemProps) => void;
}

export const ServiceItem: FC<ServiceItemComponentProps> = (props) => {
  const {
    id,
    service,
    sampleType,
    // hostSpecies,
    numberOfSamples,
    displayError,
  } = props;

  const [serviceItemState, setState] = useState({
    service: service ?? "",
    sampleType: sampleType ?? "",
    // hostSpecies: hostSpecies ?? "",
    numberOfSamples: numberOfSamples ?? 1,
  });
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  // const [selectedHostSpecies, setSelectedHostSpecies] = useState(
  //   hostSpecies ?? "",
  // );
  const [otherHostSpecies, setOtherHostSpecies] = useState("");

  const hasServiceError = useMemo(
    () => displayError && serviceItemState.service === "",
    [displayError, serviceItemState.service],
  );
  const hasSampleTypeError = useMemo(
    () => (displayError ? serviceItemState.sampleType === "" : false),
    [displayError, serviceItemState.sampleType],
  );

  // const hasHostSpeciesError = useMemo(
  //   () => (displayError ? serviceItemState.hostSpecies === "" : false),
  //   [displayError, serviceItemState.hostSpecies],
  // );

  const onUpdate = (serviceItem: {
    service: string;
    sampleType: string;
    // hostSpecies: string;
    numberOfSamples: number;
  }) => {
    setState(serviceItem);
    props.onUpdate(id, { ...serviceItem, id: id, displayError: displayError });
  };

  // const handleHostSpeciesSelect = (event: SelectChangeEvent<string>) => {
  //   const { value } = event.target;
  //   setSelectedHostSpecies(value);

  //   if (value.includes("Other")) {
  //     setIsOtherSelected(true);
  //     onUpdate({ ...serviceItemState, hostSpecies: "" });
  //   } else {
  //     setIsOtherSelected(false);
  //     onUpdate({ ...serviceItemState, hostSpecies: value });
  //     setOtherHostSpecies("");
  //   }
  // };

  // const onChangeOtherHostSpecies = (event: ChangeEvent<HTMLInputElement>) => {
  //   setOtherHostSpecies(event.target.value);
  //   onUpdate({ ...serviceItemState, hostSpecies: event.target.value });
  // };

  return (
    <>
      <Stack
        direction={"row"}
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        <div>Service {props.index + 1}</div>
        <Button onClick={() => props.onRemove(props.id)} sx={{ padding: 0 }}>
          Remove service
        </Button>
      </Stack>
      <Card
        variant="outlined"
        sx={{
          borderWidth: 2,
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        <CardContent sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
            }}
            flexDirection={"row"}
            alignItems={"flex-start"}
            alignContent={"flex-start"}
            justifyContent={"space-between"}
            minWidth={200}
          >
            <FormControl
              sx={{ minWidth: 150, margin: 2 }}
              error={hasServiceError}
            >
              <InputLabel id="service-label">Service *</InputLabel>
              <Select
                value={serviceItemState.service}
                label="Service *"
                onChange={(e) =>
                  onUpdate({ ...serviceItemState, service: e.target.value })
                }
                labelId="service-label"
              >
                {props.serviceOptions.map((service) => (
                  <MenuItem key={service} value={service}>
                    {service}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>
            <FormControl
              sx={{ minWidth: 170, margin: 2 }}
              error={hasSampleTypeError}
            >
              <InputLabel id="sample-type-label">Sample Type *</InputLabel>
              <Select
                value={serviceItemState.sampleType}
                label="Sample Type *"
                onChange={(e) =>
                  onUpdate({ ...serviceItemState, sampleType: e.target.value })
                }
                labelId="sample-type-label"
              >
                {props.sampleTypeOption.map((sampleType) => (
                  <MenuItem key={sampleType} value={sampleType}>
                    {sampleType}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>

            <FormControl sx={{ minWidth: 200, margin: 2 }}>
              <NumberInput
                aria-label="Number of Samples"
                placeholder="Number of Samples"
                min={1}
                value={serviceItemState.numberOfSamples}
                onChange={(event, val) => {
                  onUpdate({
                    ...serviceItemState,
                    numberOfSamples: val ?? 1,
                  });
                }}
              />
              <FormHelperText>Number of samples</FormHelperText>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "flex",
            }}
            flexDirection={"row"}
          >
            {/*<FormControl
              sx={{
                m: 2,
                minWidth: 270,
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              <Box>
                <InputLabel id="host-species-label">Host Species *</InputLabel>
                <Select
                  sx={{
                    minWidth: 170,
                  }}
                  value={selectedHostSpecies}
                  label="Host Species *"
                  onChange={handleHostSpeciesSelect}
                  labelId="host-species-label"
                >
                  {props.hostSpeciesOptions?.map((hostSpecies) => (
                    <MenuItem key={hostSpecies} value={hostSpecies}>
                      {hostSpecies}
                    </MenuItem>
                  ))}
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                <FormHelperText>Required</FormHelperText>
              </Box>
              {isOtherSelected && (
                <TextField
                  sx={{
                    minWidth: 300,
                    mt: 2,
                  }}
                  error={hasHostSpeciesError}
                  label="Please specify the host species"
                  value={otherHostSpecies}
                  onChange={onChangeOtherHostSpecies}
                  fullWidth
                  margin="normal"
                />
              )}
            </FormControl>
            */}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
