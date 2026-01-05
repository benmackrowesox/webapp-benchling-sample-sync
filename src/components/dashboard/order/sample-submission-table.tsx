import cloneDeep from "lodash/cloneDeep";
import type { FC } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { SampleStatus } from "../../../types/order";
import {
  DataGrid,
  GridRowId,
  GridValidRowModel,
  useGridApiRef,
  GridCallbackDetails,
  GridRowSelectionModel,
  GridValueOptionsParams,
  gridSortedRowIdsSelector,
  MuiEvent,
  GridRowParams,
} from "@mui/x-data-grid";
import React from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { Plus } from "src/icons/plus";
import { SeverityPillColor } from "src/components/severity-pill";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

export interface SampleSubmissionMetadataField {
  helpText?: string;
  name: string;
  displayName: string;
  displayOnOrder: boolean;
  displayIndex: number;
  type:
    | "string"
    | "dateTime"
    | "boolean"
    | "number"
    | "singleSelect"
    | "multiSelect";
  units?: string | Array<string>;
  valueOptions?: string[];
  gridColumnWidth?: number;
}

interface SampleSubmissionTableProps {
  columns: Array<any>;
  rows: Array<any>;
  fieldInfo: Record<string, React.ReactElement>;
  allMetadataFields: SampleSubmissionMetadataField[];
  availableSampleIds: Array<{ sampleId: string; service: string }>;
  usedSampleIds: string[];
  saveForLater: (updates: Map<GridRowId, GridValidRowModel>) => Promise<void>;
  submit: (selection: GridValidRowModel[]) => Promise<void>;
}

export const SampleSubmissionTable: FC<SampleSubmissionTableProps> = (
  props
) => {
  const {
    columns,
    rows,
    allMetadataFields,
    fieldInfo,
    saveForLater,
    submit,
    ...other
  } = props;
  columns[0].valueOptions = (params: GridValueOptionsParams<any>) => {
    const samples =
      params.row && params.row.service
        ? availableSamples.filter((x) => x.service == params.row.service) // note: this doesn't allow reselection!
        : availableSamples;
    return samples.map((s) => s.sampleId).concat([""]);
  };
  columns[0].onChange;

  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const apiRef = useGridApiRef();
  const [bulkUpdateSelection, updateBulkUpdateSelection] = React.useState<
    SampleSubmissionMetadataField | undefined
  >();
  const [bulkUpdateValue, updateBulkUpdateValue] = React.useState("");
  const [bulkUpdateArrayValue, updateBulkUpdateArrayValue] = React.useState<
    string[]
  >([]);
  const [selectedRows, setSelectedRows] = React.useState<GridRowSelectionModel>(
    []
  );
  const [hasUnsavedRows, setHasUnsavedRows] = React.useState(false);
  const [availableSamples, setAvailableSamples] = React.useState(
    props.availableSampleIds.filter(
      (s) => !props.usedSampleIds.find((us) => us == s.sampleId)
    )
  );
  const [nextId, setNextId] = React.useState<number>(rows.length);
  const [currentField, setCurrentField] = React.useState<string | undefined>();

  const unsavedChangesRef = React.useRef<{
    unsavedRows: Record<GridRowId, GridValidRowModel>;
    rowsBeforeChange: Record<GridRowId, GridValidRowModel>;
  }>({
    unsavedRows: {},
    rowsBeforeChange: {},
  });

  const theme = useTheme();

  // const cellClassName = (params: GridCellParams<any, any>): string => {
  //   if (params.isEditable) {
  //     return "";
  //   } else {
  //     return "uneditable";
  //   }
  // };

  interface SampleRow {
    id: number;
    sampleId: string;
    service: string;
    sampleStatus: string;
    taxonomicID?: string;
    qPCRPathogens?: string;
  }

  function isRowSelectable(row: any) {
    return row.editable;
  }

  function isCellEditable(row: any, colDef: any) {
    if (colDef.field == "qPCRPathogens") {
      return row.service == "qPCR";
    } else if (colDef.field == "taxonomicID") {
      return row.service == "GenomeSequencing";
    }
    return true;
  }

  const processRowUpdate = (
    newRow: SampleRow,
    oldRow: SampleRow
  ): SampleRow | Promise<SampleRow> => {
    const rowId = newRow.id;

    unsavedChangesRef.current.unsavedRows[rowId] = newRow;
    if (!unsavedChangesRef.current.rowsBeforeChange[rowId]) {
      unsavedChangesRef.current.rowsBeforeChange[rowId] = oldRow;
    }
    setHasUnsavedRows(true);

    if (oldRow.sampleId != newRow.sampleId) {
      let newAvailableSamples = availableSamples;
      const idx = newAvailableSamples.findIndex(
        (x) => x.sampleId == newRow.sampleId
      );
      if (idx != -1) {
        const selectedSample = newAvailableSamples.splice(idx, 1)[0];
        newRow.service = selectedSample.service;
      }
      if (oldRow.sampleId) {
        newAvailableSamples.push({
          sampleId: oldRow.sampleId,
          service: oldRow.service,
        });
      }

      setAvailableSamples(newAvailableSamples);
    } else if (oldRow.service != newRow.service) {
      newRow.sampleId = "";
      if (oldRow.service == "GenomeSequencing") {
        newRow.taxonomicID = "";
      } else if (oldRow.service == "qPCR") {
        newRow.qPCRPathogens = "";
      }

      if (oldRow.sampleId) {
        availableSamples.push({
          sampleId: oldRow.sampleId,
          service: oldRow.service,
        });
      }

      setAvailableSamples(availableSamples);
    }
    return newRow;
  };

  const submitChanges = () => {
    try {
      setIsSubmitting(true);
      const rowsToSubmit =
        selectedRows.length > 0
          ? selectedRows.map((x) => apiRef.current.getRow(x)!)
          : Array.from(apiRef.current.getRowModels().values());
      saveChanges()
        .then(async () => {
          await submit(rowsToSubmit);
        })
        .catch((error: any) => {
          setIsSubmitting(false);
          console.error(error?.message);
        });
    } catch (error) {
      setIsSubmitting(false);
      console.error(error?.message);
    }
  };

  const saveChanges = async () => {
    try {
      // persist updates in the database
      setIsSaving(true);
      const allRows = apiRef.current.getRowModels();
      await saveForLater(allRows);

      setIsSaving(false);
      const rowsToDelete = Object.values(
        unsavedChangesRef.current.unsavedRows
      ).filter((row) => row._action === "delete");
      if (rowsToDelete.length > 0) {
        apiRef.current.updateRows(rowsToDelete);
      }

      setHasUnsavedRows(false);
      unsavedChangesRef.current = {
        unsavedRows: {},
        rowsBeforeChange: {},
      };
    } catch (error) {
      console.error(error?.message);
      setIsSaving(false);
      throw error;
    }
  };

  const bulkUpdate = () => {
    // doing it one by one as only pro version supports multiple row updates
    // updateRows does not call processRowUpdate, so doing it manually, here,
    // so that change tracking works as expected.
    // updateRows does accept a partial update, but giving it the entire row
    // in case processRowUpdate modifies anything else on the row: it has its own logic.
    selectedRows.forEach((id) => {
      const col = apiRef.current.getColumn(bulkUpdateSelection!.name);
      const oldRow = apiRef.current.getRow<SampleRow>(id);
      if (
        (oldRow?.sampleStatus && oldRow.sampleStatus != "sample-collected") || // prevent admin bulk editing submitted samples, for safety
        !isCellEditable(oldRow, col)
      ) {
        return;
      }

      const newRow: any = cloneDeep(oldRow);
      if (bulkUpdateSelection?.type == "dateTime") {
        newRow[bulkUpdateSelection!.name] = new Date(bulkUpdateValue);
      } else if (bulkUpdateSelection?.type == "multiSelect") {
        newRow[bulkUpdateSelection!.name] = [...bulkUpdateArrayValue];
      } else {
        newRow[bulkUpdateSelection!.name] = bulkUpdateValue;
      }

      const updatedRow = processRowUpdate(newRow, oldRow!);
      apiRef.current.updateRows([updatedRow]);
    });
  };

  const addRow = () => {
    const initialStatus: SampleStatus = "sample-collected";
    apiRef.current.updateRows([
      {
        id: nextId,
        sampleId: "",
        service: "",
        sampleStatus: initialStatus,
        editable: true,
      },
    ]);
    setNextId(nextId + 1);
  };

  const handleRowSelectionChanged = (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails<any>
  ) => {
    setSelectedRows(rowSelectionModel);
  };

  const handleCellKeyDown = (
    params: any,
    event: MuiEvent<React.KeyboardEvent>
  ) => {
    // default behaviour: jump to bottom cell. Open edit view instead.
    if (event.key === " " && params.cellMode == "view") {
      event.stopPropagation();
      apiRef.current.startCellEditMode({ field: params.field, id: params.id });
      return;
    }
    if (
      params.colDef.type == "singleSelect" &&
      (event.key === "Enter" || event.key === "Tab" || event.key === " ") &&
      params.cellMode == "edit"
    ) {
      // default behaviour for single select doesn't handle tab.
      event.stopPropagation();
      apiRef.current.stopCellEditMode({
        field: params.field,
        id: params.id,
        cellToFocusAfter: event.key === "Enter" ? "below" : "right",
        ignoreModifications: false,
      });
      return;
    }
    if (event.key !== "Tab") {
      return;
    }

    const rowIds = gridSortedRowIdsSelector(apiRef.current.state);
    const visibleColumns = apiRef.current.getVisibleColumns();

    const nextCell = {
      rowIndex: rowIds.findIndex((id) => id === params.id),
      columnIndex: apiRef.current.getColumnIndex(params.field),
    };

    if (
      nextCell.columnIndex === visibleColumns.length - 1 &&
      nextCell.rowIndex === rowIds.length - 1 &&
      !event.shiftKey
    ) {
      // do nothing if we are at the last cell of the last row
      return;
    }

    if (
      nextCell.columnIndex === 0 &&
      nextCell.rowIndex === 0 &&
      event.shiftKey
    ) {
      // do nothing if we are at the first cell of the first row
      return;
    }

    event.preventDefault();
    event.defaultMuiPrevented = true;

    if (!event.shiftKey) {
      if (nextCell.columnIndex < visibleColumns.length - 1) {
        nextCell.columnIndex += 1;
      } else {
        nextCell.rowIndex += 1;
        nextCell.columnIndex = 0;
      }
    } else if (nextCell.columnIndex > 0) {
      nextCell.columnIndex -= 1;
    } else {
      nextCell.rowIndex -= 1;
      nextCell.columnIndex = visibleColumns.length - 1;
    }
    apiRef.current.scrollToIndexes(nextCell);

    const field = visibleColumns[nextCell.columnIndex].field;
    const id = rowIds[nextCell.rowIndex];
    apiRef.current.setCellFocus(id, field);
  };

  const statusColourMap: { [status: string]: SeverityPillColor } = {
    "sample-collected": "warning",
    "sample-returned": "error",
    processing: "info",
    complete: "success",
  };

  const statuses: SampleStatus[] = [
    "sample-collected",
    "sample-returned",
    "processing",
    "complete",
  ];
  const statusColours: any = {};
  for (const s in statuses) {
    const status = statuses[s];
    const palette = theme.palette[statusColourMap[status]];
    statusColours[`& .${status}`] = {
      backgroundColor: palette.main,
      color: palette.contrastText,
    };
  }

  function toInputType(
    muiDataGridDataType: string
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

  return (
    <Box sx={{ overflow: "auto", minHeight: 500 }}>
      <Box
        sx={{
          width: "100%",
          display: "table",
          tableLayout: "fixed",
          "& .uneditable": { opacity: 0.4 },
          ...statusColours,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <LoadingButton
            disabled={!hasUnsavedRows}
            loading={isSaving}
            onClick={saveChanges}
            startIcon={<SaveIcon />}
            loadingPosition="start"
          >
            <span>Save for later</span>
          </LoadingButton>
          {/* <Button
            disabled={!hasUnsavedRows || isSaving}
            onClick={discardChanges}
            startIcon={<RestoreIcon />}
          >
            Discard all changes
          </Button> */}
          <Button
            disabled={isSaving || availableSamples.length == 0}
            onClick={() => addRow()}
            startIcon={<Plus />}
          >
            Add Sample
          </Button>
        </div>
        <DataGrid
          columns={columns}
          rows={rows}
          apiRef={apiRef}
          isRowSelectable={(params: GridRowParams<SampleRow>) =>
            isRowSelectable(params.row)
          }
          isCellEditable={(params) =>
            isRowSelectable(params.row) &&
            isCellEditable(params.row, params.colDef)
          }
          onRowSelectionModelChange={(rowSelectionModel, details) =>
            handleRowSelectionChanged(rowSelectionModel, details)
          }
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                  pt: 4,
                  height: 50,
                }}
              >
                <Typography variant="body2">
                  No samples submitted. Click{" "}
                  <Typography variant="caption">+ Add Sample</Typography> to add
                  row.
                </Typography>
              </Box>
            ),
          }}
          checkboxSelection
          hideFooterPagination
          disableRowSelectionOnClick
          onCellKeyDown={handleCellKeyDown}
          autoHeight={true}
          hideFooterSelectedRowCount
          slotProps={{
            cell: {
              onFocus: (event: any) => {
                setCurrentField(
                  event?.currentTarget?.getAttribute("data-field")
                );
              },
            },
          }}
          processRowUpdate={processRowUpdate}
        />
        <LoadingButton
          loading={isSubmitting}
          variant="contained"
          onClick={submitChanges}
          sx={{ mb: 5 }}
        >
          {selectedRows.length > 0 ? "Submit selected" : "Submit"}
        </LoadingButton>

        {currentField && fieldInfo[currentField]}

        {selectedRows.length > 0 && (
          <>
            <Typography variant="subtitle2">
              Bulk update - {selectedRows.length} selected rows
            </Typography>

            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                width: "100%",
                mt: 5,
              }}
            >
              <FormControl sx={{ width: 200 }}>
                <InputLabel id="column-select-label">Column</InputLabel>

                <Select
                  id="columnSelect"
                  labelId="column-select-label"
                  label="Column"
                  onChange={(e) =>
                    updateBulkUpdateSelection(
                      allMetadataFields.find((f) => f.name == e.target.value)
                    )
                  }
                  value={bulkUpdateSelection?.name}
                >
                  {allMetadataFields.map((m) => (
                    <MenuItem key={m.name} value={m.name}>
                      {m.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: "300", width: "70%" }}>
                {(bulkUpdateSelection?.type == "string" ||
                  bulkUpdateSelection?.type == "number" ||
                  bulkUpdateSelection?.type == "dateTime") && (
                  <TextField
                    label="Value"
                    type={toInputType(bulkUpdateSelection.type)}
                    value={
                      bulkUpdateValue ||
                      (bulkUpdateSelection?.type == "dateTime"
                        ? new Date()
                        : "")
                    }
                    onChange={(e) => updateBulkUpdateValue(e.target.value)}
                  />
                )}
                {bulkUpdateSelection?.type == "singleSelect" && (
                  <>
                    <InputLabel id="value-select-label">Value</InputLabel>
                    <Select
                      id="valueSelect"
                      labelId="value-select-label"
                      label="Column"
                      value={bulkUpdateValue}
                      onChange={(e) => updateBulkUpdateValue(e.target.value)}
                    >
                      {bulkUpdateSelection.valueOptions?.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>{" "}
                  </>
                )}
                {bulkUpdateSelection?.type == "multiSelect" && (
                  <>
                    <Autocomplete
                      multiple
                      options={bulkUpdateSelection.valueOptions ?? []}
                      value={bulkUpdateArrayValue}
                      onChange={(el, val) => updateBulkUpdateArrayValue(val)}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option}
                        </li>
                      )}
                      style={{ width: 500 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={bulkUpdateSelection.displayName}
                        />
                      )}
                    />
                  </>
                )}
              </FormControl>
              <Button variant="contained" onClick={(e) => bulkUpdate()}>
                Update
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};
