// "use client";

// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { Dayjs } from "dayjs";

// interface Props {
//   label?: string;
//   value: Dayjs | null;
//   onChange: (val: Dayjs | null) => void;
// }

// export default function ClientDatePicker({ label, value, onChange }: Props) {
//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <DatePicker
//         label={label}
//         value={value}
//         onChange={onChange}
//         slotProps={{ textField: { fullWidth: true } }}
//         // Force desktop popover to prevent mobile modal issues
//         desktopModeMediaQuery="(max-width: 10000px)"
//       />
//     </LocalizationProvider>
//   );
// }

"use client";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

interface Props {
  label?: string;
  value: Dayjs | null;
  onChange: (val: Dayjs | null) => void;
}

export default function ClientDatePicker({ label, value, onChange }: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        slotProps={{ textField: { fullWidth: true } }}
        desktopModeMediaQuery="(max-width: 10000px)"
      />
    </LocalizationProvider>
  );
}
