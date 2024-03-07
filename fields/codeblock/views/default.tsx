import React, { useState } from "react";
import type { WrapperProps } from "../wrapper";
import { editor } from "monaco-editor";
import Editor, { Monaco, OnChange } from "@monaco-editor/react";

export default function View(props: WrapperProps) {
  const [lineHeight, setLineHeight] = useState<number>(19);

  function onMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    setLineHeight(
      editor.getOption(monaco.editor.EditorOption.fontInfo).lineHeight
    );
  }

  const onChange: OnChange = (value, event) => {
    if (value !== undefined) {
      props.onChange!({
        ...props.value,
        inner: { kind: "value", value },
      });
    }
  };
  return (
    <Editor
      height={
        lineHeight *
        Math.min(
          25,
          Math.max(
            5,
            props.value.inner.kind === "null"
              ? 5
              : props.value.inner.value?.split(/\r\n|\r|\n/).length
          )
        )
      }
      defaultLanguage={props.field.viewProps?.language}
      value={props.value.inner.kind === "null" ? "" : props.value.inner.value}
      onChange={onChange}
      theme={props.field.viewProps?.theme || "vs-light"}
      options={props.field.viewProps?.options}
      onMount={onMount}
    />
  );
}
