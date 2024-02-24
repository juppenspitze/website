import ExampleTheme from "@/themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import TreeViewPlugin from "@/plugins/TreeViewPlugin";
import ToolbarPlugin from "@/plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { TRANSFORMERS } from "@lexical/markdown";

import ListMaxIndentLevelPlugin from "@/plugins/ListMaxIndentLevelPlugin";
import { MaxLengthPlugin } from "@/plugins/MaxLengthPlugin";
import CodeHighlightPlugin from "@/plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "@/plugins/AutoLinkPlugin";
import { useEffect, useState } from "react";
import HtmlPlugin from "@/plugins/HtmlPlugin";
import { useTranslations } from "next-intl";

const editorConfig = {
  // The editor theme
  theme: ExampleTheme,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode
  ]
};

const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
);
export function validateUrl(url) {
  return url === 'https://' || urlRegExp.test(url);
};


export default function Editor({onHtmlChange, locale, initialHtml, maxLength, setIsMaxLengthExceeded, setCurrentLength}) {
  const tRichText = useTranslations('RichText');

  if (!maxLength) { maxLength = 500; };

  function Placeholder() {
    return <div className="editor-placeholder">{tRichText('rich_description')}</div>;
  };

  return (<div>
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HtmlPlugin
            onHtmlChanged={(html) => onHtmlChange(locale, html)}
            initialHtml={initialHtml}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <LinkPlugin validateUrl={validateUrl} />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <MaxLengthPlugin maxLength={maxLength} setIsMaxLengthExceeded={setIsMaxLengthExceeded} setCurrentLength={setCurrentLength} />
        </div>
      </div>
      <div className="text-sm text-textSecondary">{tRichText('link_description')}</div>
    </LexicalComposer>
  </div>);
}
