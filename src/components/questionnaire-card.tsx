import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { italicizeContentInBrackets } from "src/utils/text-formatting";

export interface QuestionnaireCardProps {
  question: string;
  questionTitle?: string;
  isRequired?: boolean;
  options: { name: string; value: any }[];
  optionsType: "checkbox" | "radio";
  choices?: string[];
  hasLatinInBrackets?: boolean;
  onChange: (e: any) => void;
}

export const QuestionnaireCard = (props: QuestionnaireCardProps) => {
  const {
    question,
    questionTitle,
    isRequired,
    options,
    optionsType,
    choices,
    onChange,
  } = props;

  if (!options) {
    return null;
  }

  return (
    <>
      <Card>
        <CardContent>
          {questionTitle && (
            <span style={{ fontWeight: "bold" }}>{`${questionTitle} - `}</span>
          )}
          {question}
          {isRequired && <span style={{ color: "#ff0000" }}>{" *"}</span>}
          <FormGroup sx={{ maxWidth: 500, mt: 2 }}>
            {optionsType == "checkbox"
              ? options.map((s, idx) =>
                  s.name == "Other" ? (
                    <TextField
                      key={idx}
                      sx={{ maxWidth: "300px", height: "40px" }}
                      label="Other (please specify)"
                      name={s.name}
                      value={s.value || ""}
                      onChange={(e) => onChange(e)}
                    />
                  ) : (
                    <FormControlLabel
                      key={idx}
                      control={
                        <Checkbox
                          checked={s.value || false}
                          onChange={(e) => onChange(e)}
                        />
                      }
                      label={
                        props.hasLatinInBrackets
                          ? italicizeContentInBrackets(s.name)
                          : s.name
                      }
                      name={s.name}
                      value={s.value || false}
                      defaultValue={s.value}
                    />
                  ),
                )
              : options.map((s, idx) => (
                  <FormControlLabel
                    key={idx}
                    label={s.name}
                    labelPlacement="start"
                    sx={{
                      justifyContent: "space-between",
                      ml: 0,
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "neutral.900"
                          : "neutral.100",
                      mb: 1,
                    }}
                    control={
                      <RadioGroup row name={s.name} value={s.value || ""}>
                        {choices!.map((choice, cIdx) => (
                          <FormControlLabel
                            key={cIdx}
                            value={choice}
                            control={<Radio onClick={(e) => onChange(e)} />}
                            label={choice}
                          />
                        ))}
                      </RadioGroup>
                    }
                  />
                ))}
          </FormGroup>
        </CardContent>
      </Card>
    </>
  );
};
