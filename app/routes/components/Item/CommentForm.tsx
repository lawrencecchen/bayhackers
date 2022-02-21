import { Form, useSearchParams } from "remix";

function CommentForm({
  parentPath,
  submitLabel,
  className = "",
}: {
  parentPath: string;
  submitLabel?: string;
  className?: string;
}) {
  return (
    <Form reloadDocument className={className} method="post">
      <input type="hidden" name="by" value="lawrence" />
      <input type="hidden" name="path" value={parentPath} />
      <textarea
        className="block border border-slate-300 px-2 py-1 w-full max-w-3xl"
        name="comment"
        aria-label="Comment"
        rows={5}
      ></textarea>

      <div className="mt-2">
        <button
          type="submit"
          className="font-bold border border-slate-300 rounded-sm text-sm px-2 py-1 hover:underline"
        >
          {submitLabel ?? "comment"}
        </button>
      </div>
    </Form>
  );
}

export default CommentForm;
