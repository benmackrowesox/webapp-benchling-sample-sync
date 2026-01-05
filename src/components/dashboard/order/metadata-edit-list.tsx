import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { Trash } from "src/icons/trash";

interface MetadataField {
  name: string;
  displayName: string;
}

interface MetadataEditListProps {
  allMetadataFields: MetadataField[];
  metadataFields: MetadataField[];
  addToList: (newItem: MetadataField) => void;
  removeFromList: (item: MetadataField) => void;
}

const MetadataEditListItem = (props: {
  metadataField: MetadataField;
  remove: (field: MetadataField) => void;
}) => {
  const { metadataField, remove } = props;

  return (
    <li>
      <span>
        {metadataField.displayName}{" "}
        <Button>
          <Trash onClick={(e) => remove(metadataField)} />
        </Button>
      </span>
    </li>
  );
};

export const MetadataEditList = (props: MetadataEditListProps) => {
  const metadataFields = props.metadataFields;
  const [newFieldSelection, updateNewFieldSelection] = useState<
    MetadataField | undefined
  >();

  return (
    <>
      <Stack>
        {metadataFields.map((f) => {
          return (
            <MetadataEditListItem
              key={f.name}
              metadataField={f}
              remove={(e) => props.removeFromList(e)}
            />
          );
        })}
        <Box
          key="metadataSelection"
          sx={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            width: "100%",
            mt: 5,
          }}
        >
          <FormControl sx={{ width: 200 }}>
            <InputLabel id="metadata-select-label">Metadata Field</InputLabel>

            <Select
              id="metadata-select"
              labelId="metadata-select-label"
              label="Metadata Field"
              onChange={(e) =>
                updateNewFieldSelection(
                  props.allMetadataFields.find((f) => f.name == e.target.value)!
                )
              }
              value={newFieldSelection?.name ?? ""}
            >
              {props.allMetadataFields.map((m) => (
                <MenuItem key={m.name} value={m.name}>
                  {m.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            sx={{ ml: 5 }}
            variant="contained"
            disabled={!newFieldSelection}
            onClick={(e) => props.addToList(newFieldSelection!)}
          >
            Add Metadata Field
          </Button>
        </Box>
      </Stack>
    </>
  );
};
