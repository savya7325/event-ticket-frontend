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
import dayjs, { Dayjs } from "dayjs";
import { darkFieldSx, darkPopperPaperSx } from "../components/theme";

interface Props {
  label?: string;
  value: Dayjs | null;
  onChange: (val: Dayjs | null) => void;
  dark?: boolean; // dark field + calendar for dark surfaces
  disablePast?: boolean;
  helperText?: string;
  error?: boolean;
}

export default function ClientDatePicker({ label, value, onChange, dark, disablePast, helperText, error }: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={disablePast ? dayjs() : undefined}
        slotProps={{
          textField: { fullWidth: true, helperText, error, sx: dark ? darkFieldSx : undefined },
          ...(dark ? { desktopPaper: { sx: darkPopperPaperSx } } : {}),
        }}
        desktopModeMediaQuery="(max-width: 10000px)"
      />
    </LocalizationProvider>
  );
}
