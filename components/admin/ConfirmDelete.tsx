"use client";

export function ConfirmDelete({
  action,
  id,
  message,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  message: string;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-clay underline-offset-4 hover:underline">
        {label}
      </button>
    </form>
  );
}
