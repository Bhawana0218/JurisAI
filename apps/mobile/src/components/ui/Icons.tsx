import * as React from "react";
import Svg, { Path, Circle, Rect, type SvgProps } from "react-native-svg";

type IconProps = { width?: number; height?: number; color?: string } & SvgProps;

function createIcon(path: string, viewBox = "0 0 24 24") {
  return ({ width = 24, height = 24, color = "currentColor", ...props }: IconProps) => (
    <Svg width={width} height={height} viewBox={viewBox} fill="none" {...props}>
      <Path d={path} fill={color} />
    </Svg>
  );
}

function createOutlineIcon(outer: string, inner?: string, viewBox = "0 0 24 24") {
  return ({ width = 24, height = 24, color = "currentColor", ...props }: IconProps) => (
    <Svg width={width} height={height} viewBox={viewBox} fill="none" {...props}>
      <Path d={outer} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {inner && <Path d={inner} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
    </Svg>
  );
}

export const LayoutDashboard = createOutlineIcon(
  "M3 9h8V3H3v6zm0 12h8v-6H3v6zm10 0h8v-6h-8v6zm0-12V3h8v6h-8z"
);

export const MessageSquare = createOutlineIcon(
  "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
);

export const FileText = createOutlineIcon(
  "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8"
);

export const Briefcase = createOutlineIcon(
  "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
);

export const Bot = createOutlineIcon(
  "M12 8V4m0 4a8 8 0 018 8v4H4v-4a8 8 0 018-8zM2 14h2m16 0h2M12 22v-4",
  "M8 14h.01M16 14h.01"
);

export const Workflow = createOutlineIcon(
  "M8 6h8M8 12h8M8 18h8M3 6h1m-1 6h1m-1 6h1M20 6h1m-1 6h1m-1 6h1"
);

export const Network = createOutlineIcon(
  "M12 2a3 3 0 013 3 3 3 0 01-1.5 2.585L13.5 10H18a2 2 0 012 2v1.415A3 3 0 1120 18v-1.585A2 2 0 0018 15h-4.5l.5 3.5A3 3 0 1112 22a3 3 0 011.5-2.585L13 16H6a2 2 0 01-2 2v2a2 2 0 002 2h12a2 2 0 002-2",
  "",
  "0 0 24 24"
);

export const BarChart3 = createOutlineIcon(
  "M3 3v18h18M7 16l4-8 4 4 4-6"
);

export const Settings = createOutlineIcon(
  "M12 15a3 3 0 100-6 3 3 0 000 6z",
  "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
);

export const Scale = createOutlineIcon(
  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
);

export const Shield = createOutlineIcon(
  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
);

export const BookOpen = createOutlineIcon(
  "M4 6h16M4 12h16M4 18h12",
  "M4 6v12M20 6v12M12 2l-4 2m4-2l4 2",
  "0 0 24 24"
);

export const Plus = createOutlineIcon(
  "M12 5v14M5 12h14"
);

export const Menu = createOutlineIcon(
  "M3 12h18M3 6h18M3 18h18"
);

export const X = createOutlineIcon(
  "M18 6L6 18M6 6l12 12"
);

export const Send = createOutlineIcon(
  "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
);

export const Search = createOutlineIcon(
  "M10 16a6 6 0 100-12 6 6 0 000 12zM21 21l-4.35-4.35"
);

export const ChevronRight = createOutlineIcon("M9 18l6-6-6-6");
export const ChevronLeft = createOutlineIcon("M15 18l-6-6 6-6");
export const ArrowRight = createOutlineIcon("M5 12h14m-6-6l6 6-6 6");
export const ArrowLeft = createOutlineIcon("M19 12H5m6-6l-6 6 6 6");
export const Check = createOutlineIcon("M20 6L9 17l-5-5");
export const Copy = createOutlineIcon("M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2", "M16 10h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2");
export const Trash2 = createOutlineIcon("M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2", "M10 11v6M14 11v6");
export const Download = createOutlineIcon("M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3");
export const Star = createOutlineIcon("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z");
export const Zap = createOutlineIcon("M13 2L3 14h9l-1 8 10-12h-9l1-8z");
export const CreditCard = createOutlineIcon("M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22");
export const Users = createOutlineIcon("M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75");
export const Key = createOutlineIcon("M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4");
export const Webhook = createOutlineIcon("M10 18a2 2 0 11-4 0 2 2 0 014 0zm4-6a2 2 0 11-4 0 2 2 0 014 0zm-4-6a2 2 0 114 0", "M6 18L12 6M12 6l6 12");
export const Puzzle = createOutlineIcon("M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 01-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 10-3.214 3.214c.446.166.855.497.925.968a.979.979 0 01-.276.837l-1.61 1.611a2.404 2.404 0 01-1.705.706 2.404 2.404 0 01-1.704-.706l-1.568-1.568a1.026 1.026 0 00-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 11-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 00-.289-.877l-1.568-1.568A2.404 2.404 0 012 10.142c0-.617.235-1.233.706-1.704l1.611-1.611a.98.98 0 01.837-.276c.47.07.802.48.968.925a2.501 2.501 0 103.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 01.276-.837l1.611-1.611a2.404 2.404 0 011.704-.706c.617 0 1.233.235 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.969a2.5 2.5 0 113.237 3.237c-.464.18-.894.527-.967 1.02z");
export const CircleCheck = createOutlineIcon("M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3");
export const Info = createOutlineIcon("M12 16v-4a1 1 0 00-1-1h-1", "M12 8h.01");
export const AlertCircle = createOutlineIcon("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01");
export const HelpCircle = createOutlineIcon("M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3", "M12 17h.01");

export const Globe = createOutlineIcon(
  "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z",
  "M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
);
