import React, { FC, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import {
  Box,
  Button,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Select,
  TextField,
} from "@mui/material";
import type { SxProps } from "@mui/system";
import type { Theme } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import LinkIcon from "@mui/icons-material/Link";
import { styled } from "@mui/material/styles";

interface TipTapEditorProps {
  onChange?: (value: string) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
  value?: string;
}

const CustomSelect = styled(Select)({
  "& .MuiSelect-outlined": {
    border: "none",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
});

const TipTapEditorRoot = styled(Box)(({ theme }) => ({
  border: 1,
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  borderStyle: "solid",
  display: "flex",
  flexDirection: "column",
  userSelect: "text",
  overflow: "hidden",
  "& .ProseMirror": {
    minHeight: 200,
    padding: 20,
    paddingTop: 0,
  },
  "& .ProseMirror:focus-visible": {
    outline: "none",
    userSelect: "text",
  },
  "& .menu-bar": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    userSelect: "none",
  },

  "& .editor-content": {
    paddingTop: 10,
  },
}));

const TipTapEditor: FC<TipTapEditorProps> = (props) => {
  const { sx, onChange, placeholder, value, ...other } = props;
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Underline,
      Bold,
      Italic,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: placeholder,
    onUpdate: ({ editor }) => {
      if (onChange && editor?.getHTML()) {
        onChange(editor?.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && value && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const handleHeadingChange = (event: any) => {
    const level = event.target.value;
    if (level) {
      editor?.chain().focus().toggleHeading({ level }).run();
    } else {
      editor?.chain().focus().unsetAllMarks().clearNodes().run();
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSetLink = () => {
    if (link) {
      editor?.chain().focus().toggleLink({ href: link }).run();
    }
    handleClose();
  };

  return (
    <TipTapEditorRoot sx={sx} {...other}>
      <div className="menu-bar">
        <CustomSelect
          value={
            editor?.isActive("heading", { level: 1 })
              ? 1
              : editor?.isActive("heading", { level: 2 })
              ? 2
              : editor?.isActive("heading", { level: 3 })
              ? 3
              : ""
          }
          onChange={handleHeadingChange}
          displayEmpty
        >
          <MenuItem value="">Normal</MenuItem>
          <MenuItem value={1}>Heading 1</MenuItem>
          <MenuItem value={2}>Heading 2</MenuItem>
          <MenuItem value={3}>Heading 3</MenuItem>
        </CustomSelect>
        <IconButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          color={editor?.isActive("bold") ? "primary" : "default"}
          aria-label="bold"
        >
          <FormatBoldIcon />
        </IconButton>
        <IconButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          color={editor?.isActive("italic") ? "primary" : "default"}
          aria-label="italic"
        >
          <FormatItalicIcon />
        </IconButton>

        <IconButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          color={editor?.isActive("underline") ? "primary" : "default"}
          aria-label="underline"
        >
          <FormatUnderlinedIcon />
        </IconButton>

        <IconButton
          onClick={handleClickOpen}
          color={editor?.isActive("link") ? "primary" : "default"}
          aria-label="link"
        >
          <LinkIcon />
        </IconButton>

        <IconButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          color={editor?.isActive("bulletList") ? "primary" : "default"}
          aria-label="bullet list"
        >
          <FormatListBulletedIcon />
        </IconButton>
        <IconButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          color={editor?.isActive("orderedList") ? "primary" : "default"}
          aria-label="numbered list"
        >
          <FormatListNumberedIcon />
        </IconButton>
        <IconButton
          onClick={() =>
            editor?.chain().focus().unsetAllMarks().clearNodes().run()
          }
          aria-label="clear formatting"
        >
          <FormatClearIcon />
        </IconButton>
      </div>
      <EditorContent editor={editor} className="editor-content" />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Link</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the URL you want to link to.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="URL"
            type="url"
            fullWidth
            variant="standard"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSetLink}>Set Link</Button>
        </DialogActions>
      </Dialog>
    </TipTapEditorRoot>
  );
};

export default TipTapEditor;
