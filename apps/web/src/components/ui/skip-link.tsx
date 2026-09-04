"use client";

import type { MouseEvent } from "react";

export function SkipLink() {
  function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const content = document.getElementById("main-content");
    content?.focus({ preventScroll: true });
    content?.scrollIntoView({ block: "start" });
  }

  return (
    <a href="#main-content" className="skip-link" onClick={skipToContent}>
      Saltar para o conteúdo
    </a>
  );
}
