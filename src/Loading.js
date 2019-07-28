import React from "react";
import loading from "./resources/35.gif";

export default function Loading() {
  return (
    <div>
      <img width="250px" src={loading} alt="Loading..." />
    </div>
  );
}
