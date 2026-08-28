import { GrowthAction } from "../types/action.js";

export function approveGrowthAction(
  action: GrowthAction
): GrowthAction {
  if (action.status !== "PROPOSED") {
    throw new Error(
      `Action cannot be approved from status: ${action.status}`
    );
  }

  return {
    ...action,
    status: "APPROVED",
  };
}

export function rejectGrowthAction(
  action: GrowthAction
): GrowthAction {
  if (action.status !== "PROPOSED") {
    throw new Error(
      `Action cannot be rejected from status: ${action.status}`
    );
  }

  return {
    ...action,
    status: "REJECTED",
  };
}