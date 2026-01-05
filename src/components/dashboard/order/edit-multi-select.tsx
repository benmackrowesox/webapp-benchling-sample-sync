import {
  Autocomplete,
  AutocompleteProps,
  Checkbox,
  Paper,
  Popper,
  TextField,
} from "@mui/material";
import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useState, useLayoutEffect, useCallback } from "react";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export const EditMultiSelect = (
  props: GridRenderEditCellParams<any, string[]>
) => {
  const { id, field, value, colDef, hasFocus } = props;
  const valueOptions: string[] = (colDef as any).valueOptions;
  const [valueState, setValueState] = useState(value);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>();
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const apiRef = useGridApiContext();

  useLayoutEffect(() => {
    if (hasFocus && inputRef) {
      inputRef.focus();
    }
  }, [hasFocus, inputRef]);

  const handleRef = useCallback((el: HTMLElement | null) => {
    setAnchorEl(el);
  }, []);

  const handleChange = useCallback<
    NonNullable<AutocompleteProps<any, any, any, any>["onChange"]>
  >(
    (el, val) => {
      setValueState(val);
      apiRef.current.setEditCellValue(
        { id, field, value: val, debounceMs: 200 },
        event
      );
    },
    [apiRef, field, id]
  );

  return (
    <div style={{ position: "relative", alignSelf: "flex-start" }}>
      <div
        ref={handleRef}
        style={{
          height: 1,
          width: colDef.computedWidth,
          display: "block",
          position: "absolute",
          top: 0,
        }}
      />
      {anchorEl && (
        <Popper open anchorEl={anchorEl} placement="bottom-start">
          <Paper elevation={1} sx={{ p: 1, minWidth: colDef.computedWidth }}>
            <Autocomplete
              multiple
              options={valueOptions}
              value={valueState}
              onChange={handleChange}
              disableCloseOnSelect
              getOptionLabel={(option) => option}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option}
                </li>
              )}
              style={{ width: 500 }}
              renderInput={(params) => (
                <TextField {...params} label={colDef.headerName} />
              )}
            />
          </Paper>
        </Popper>
      )}
    </div>
  );
};
