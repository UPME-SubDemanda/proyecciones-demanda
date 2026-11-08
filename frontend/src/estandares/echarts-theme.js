/* Generado por scripts/build_tokens.py. NO EDITAR A MANO (TOK-01). */
// echarts.registerTheme('upme-light', themeLight); echarts.registerTheme('upme-dark', themeDark)
export const themeLight = {
  "color": [
    "#8C6400",
    "#3B7300",
    "#8FB0F5",
    "#C3A6F5",
    "#F59B7A",
    "#5FD4C9",
    "#A8A8A8"
  ],
  "backgroundColor": "transparent",
  "textStyle": {
    "fontFamily": "Nunito Sans, Verdana, system-ui, sans-serif",
    "color": "#262626"
  },
  "title": {
    "textStyle": {
      "color": "#262626",
      "fontWeight": 700,
      "fontSize": 18
    },
    "subtextStyle": {
      "color": "#5C5C5C",
      "fontSize": 13
    }
  },
  "legend": {
    "textStyle": {
      "color": "#5C5C5C"
    }
  },
  "tooltip": {
    "backgroundColor": "#FFFFFF",
    "borderColor": "#DEDCD5",
    "textStyle": {
      "color": "#262626"
    }
  },
  "categoryAxis": {
    "axisLine": {
      "lineStyle": {
        "color": "#8C8A84"
      }
    },
    "axisLabel": {
      "color": "#5C5C5C"
    },
    "splitLine": {
      "show": false
    }
  },
  "valueAxis": {
    "axisLine": {
      "show": false
    },
    "axisLabel": {
      "color": "#5C5C5C"
    },
    "splitLine": {
      "lineStyle": {
        "color": "#DEDCD5"
      }
    },
    "nameTextStyle": {
      "color": "#5C5C5C"
    }
  },
  "timeAxis": {
    "axisLine": {
      "lineStyle": {
        "color": "#8C8A84"
      }
    },
    "axisLabel": {
      "color": "#5C5C5C"
    }
  },
  "line": {
    "symbol": "none",
    "lineStyle": {
      "width": 2.5
    }
  },
  "dataZoom": {
    "borderColor": "#DEDCD5",
    "fillerColor": "#FBF1D6",
    "handleStyle": {
      "color": "#E4B33C"
    }
  },
  "aria": {
    "enabled": true
  }
};
export const themeDark = {
  "color": [
    "#E4B33C",
    "#B8FF65",
    "#8FB0F5",
    "#C3A6F5",
    "#F59B7A",
    "#5FD4C9",
    "#A8A8A8"
  ],
  "backgroundColor": "transparent",
  "textStyle": {
    "fontFamily": "Nunito Sans, Verdana, system-ui, sans-serif",
    "color": "#F2F2F2"
  },
  "title": {
    "textStyle": {
      "color": "#F2F2F2",
      "fontWeight": 700,
      "fontSize": 18
    },
    "subtextStyle": {
      "color": "#A8A8A8",
      "fontSize": 13
    }
  },
  "legend": {
    "textStyle": {
      "color": "#A8A8A8"
    }
  },
  "tooltip": {
    "backgroundColor": "#1C1C1C",
    "borderColor": "#333333",
    "textStyle": {
      "color": "#F2F2F2"
    }
  },
  "categoryAxis": {
    "axisLine": {
      "lineStyle": {
        "color": "#6E6E6E"
      }
    },
    "axisLabel": {
      "color": "#A8A8A8"
    },
    "splitLine": {
      "show": false
    }
  },
  "valueAxis": {
    "axisLine": {
      "show": false
    },
    "axisLabel": {
      "color": "#A8A8A8"
    },
    "splitLine": {
      "lineStyle": {
        "color": "#333333"
      }
    },
    "nameTextStyle": {
      "color": "#A8A8A8"
    }
  },
  "timeAxis": {
    "axisLine": {
      "lineStyle": {
        "color": "#6E6E6E"
      }
    },
    "axisLabel": {
      "color": "#A8A8A8"
    }
  },
  "line": {
    "symbol": "none",
    "lineStyle": {
      "width": 2.5
    }
  },
  "dataZoom": {
    "borderColor": "#333333",
    "fillerColor": "#3A2E10",
    "handleStyle": {
      "color": "#E4B33C"
    }
  },
  "aria": {
    "enabled": true
  }
};
// Colores por rol (GRA-01). Usar roles[modo].products.<clave>.line, nunca hexadecimales.
export const roles = {
  "light": {
    "real": "#262626",
    "scenario": "#5C5C5C",
    "revisionPast": "#A8A6A0",
    "reference": "#5C5C5C",
    "negative": "#B42318",
    "series": [
      "#E4B33C",
      "#8FB0F5",
      "#C3A6F5",
      "#F59B7A",
      "#5FD4C9",
      "#A8A8A8"
    ],
    "products": {
      "ee": {
        "line": "#8C6400",
        "fill": "#E4B33C",
        "band": "rgba(228, 179, 60, 0.28)",
        "name": "Energía eléctrica"
      },
      "gn": {
        "line": "#3B7300",
        "fill": "#B8FF65",
        "band": "rgba(184, 255, 101, 0.45)",
        "name": "Gas natural"
      }
    }
  },
  "dark": {
    "real": "#F2F2F2",
    "scenario": "#A8A8A8",
    "revisionPast": "#5A5A5A",
    "reference": "#A8A8A8",
    "negative": "#F97066",
    "series": [
      "#E4B33C",
      "#8FB0F5",
      "#C3A6F5",
      "#F59B7A",
      "#5FD4C9",
      "#A8A8A8"
    ],
    "products": {
      "ee": {
        "line": "#E4B33C",
        "fill": "#E4B33C",
        "band": "rgba(228, 179, 60, 0.22)",
        "name": "Energía eléctrica"
      },
      "gn": {
        "line": "#B8FF65",
        "fill": "#B8FF65",
        "band": "rgba(184, 255, 101, 0.20)",
        "name": "Gas natural"
      }
    }
  }
};
export const dash = {"projection": [10, 7], "scenario": [3, 4], "reference": [3, 4]};
export const lineWidth = {"real": 2.5, "projection": 2.5, "revisionPast": 1, "kiosk": 3.5};
