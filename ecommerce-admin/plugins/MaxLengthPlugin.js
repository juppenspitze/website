import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {trimTextContentFromAnchor} from '@lexical/selection';
import {$restoreEditorState} from '@lexical/utils';
import {$getSelection, $isRangeSelection, EditorState, RootNode} from 'lexical';
import {useEffect} from 'react';

export function MaxLengthPlugin({maxLength,setCurrentLength,setIsMaxLengthExceeded}) {
  if (!setIsMaxLengthExceeded) return;
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let lastRestoredEditorState = null;

    return editor.registerNodeTransform(RootNode, (rootNode) => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) { return; };

      const prevEditorState = editor.getEditorState();
      const prevTextContentSize = prevEditorState.read(() =>
        rootNode.getTextContentSize(),
      );
      const textContentSize = rootNode.getTextContentSize();
      setCurrentLength(textContentSize);
      if (prevTextContentSize !== textContentSize) {
        const delCount = textContentSize - maxLength;
        const anchor = selection.anchor;

        if (delCount > 0) {
          if (prevTextContentSize === maxLength && lastRestoredEditorState !== prevEditorState) {
            lastRestoredEditorState = prevEditorState;
            $restoreEditorState(editor, prevEditorState);
          } else {
            trimTextContentFromAnchor(editor, anchor, delCount);
          }
          setIsMaxLengthExceeded(true);
        } else {
          setIsMaxLengthExceeded(false);
        };
      }
    });
  }, [editor, maxLength]);

  return null;
}