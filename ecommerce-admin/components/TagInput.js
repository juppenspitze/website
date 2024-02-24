import { useTranslations } from "next-intl";
import { TagsInput } from "react-tag-input-component";

export default function TagInput({productTags, setProductTags}) {
  const tTagsInput = useTranslations('TagsInput');
  return (
    <div>
      <TagsInput
        value={productTags}
        onChange={setProductTags}
        name="Product tags"
        placeHolder={tTagsInput('enter_tags_here')}
      />
      <div className="text-sm text-textSecondary">{tTagsInput('description')}</div>
    </div>
  );
};