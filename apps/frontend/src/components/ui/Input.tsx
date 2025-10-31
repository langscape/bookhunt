"use client";

import React from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm text-slate-300">{children}</label>;
}

export default function Input({ className, ...rest }: Props) {
  return (
    <input
      className={cx(
        "w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none",
        className,
      )}
      {...rest}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      className={cx(
        "w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none",
        props.className,
      )}
      rows={props.rows ?? 4}
      {...props}
    />
  );
}
