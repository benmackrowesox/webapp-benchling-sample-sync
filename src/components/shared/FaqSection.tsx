import * as React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/system/Box";
import { FC, ReactNode } from "react";

interface FaqProps {
  key: string;
  question: ReactNode;
  children?: ReactNode;
  expanded: boolean;
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

interface FaqSectionProps {
  title?: string;
  headline?: string;
  faqs: {
    key: string;
    question: ReactNode;
    children?: ReactNode;
  }[];
}

export const FaqSection: FC<FaqSectionProps> = (props) => {
  const { title = "What you need to know", headline = "FAQs", faqs } = props;
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Box
      sx={(theme) => ({
        background: theme.palette.primary.dark,
        color: "white",
        padding: 5,
      })}
    >
      <Box maxWidth="md" marginLeft="auto" marginRight="auto">
        <Typography fontSize="1.25em">{title}</Typography>
        <Typography fontSize="2em" color={"gold"} marginTop={1}>
          {headline}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {faqs?.map((faq) => (
            <Faq
              key={faq.key}
              question={faq.question}
              children={faq.children}
              expanded={expanded === faq.key}
              onChange={handleChange(faq.key)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const Faq: FC<FaqProps> = (props) => {
  const { question, children, expanded, onChange } = props;
  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      sx={{ background: "transparent", color: "white" }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "gold" }} />}>
        {question}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
