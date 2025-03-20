import * as yup from "yup";

export const taskSchema = yup.object().shape({
  title: yup.string().trim().required("Title is required"),
  description: yup.string().trim().required("Description is required"),
  assignedTo: yup.string().trim().required("AssignedTo is required"),
  status: yup.string().oneOf(["pending", "in-progress", "completed"], "Invalid status").required("Status is required"),
  priority: yup.string().oneOf(["low", "medium", "high"], "Invalid priority").required("Priority is required"),
  dueDate: yup.date().required("Due Date is required"),
});
