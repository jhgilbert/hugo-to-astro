export interface ParsedContentEntry {
  item: {
    type: "shortcode" | "htmlTag";
    data?: any;
  };
  children: ParsedContentEntry[];
}
