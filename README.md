# Interactive Scatter Plot - DataVis Assignment 2

**Author:** Gülce Erdoğan Babayev  
**Institution:** TU Dresden  
**Course:** Data Visualization  

## Project Overview
This project implements an interactive scatter plot to explore multidimensionall car data using **D3.js** for **Assignment 2** in the Data Visualization course. Example photos of the scatter plots are in the **photos** folder.

The visualization maps several car attributes using different visual encodings:

- **x-axis:** City miles per gallon (MPG)  
- **y-axis:** Retailer cost  
- **color:** Vehicle type  
- **size:** Engine size 

*Note:* Engine size is scaled using a *Stevens‘s Power Law*

## Data Loading & Preprocessing
The dataset is loaded from the **cars.csv** file.

### Data validation steps:
- Applied numeric, boolean, and string checks for all fields.  
- Ensured numeric values were **greater than zero** to eliminate invalid entries.  
- Removed unrealistic outliers using defined ranges.  
- Replaced incorrect or missing values with **null**.  
- All entries containing null values for required attributes were **filtered out** when drawing the scatter plot.

This ensures a **clean and reliable dataset** for visualization.

## Features
### Zooming
- Users can zoom in and out to explore dense or sparse regions.  
- Axes dynamically update during zoom operations.

### Tooltip
Hovering over a point displays a tooltip containing:
- Name  
- Type  
- Retail Price  
- MPG  
- Engine Size  

This highlights a point while dimming others and guide lines appear to support precise axis reading at the 

### Point Selection (Details Panel)
- Clicking a point selects it and displays detailed information in a sidebar.  
- Other points fade to emphasize the selected car.  
- Clicking again deselects and resets the view.

### Type Selection (Legend Interaction)
- Clicking a vehicle type in the legend highlights *only* cars of that type.  
- Other points fade out to emphasize the selected car type.
- When a type is selected, only points of that type can be hovered or selected.  
- If a point is deselected, the type filter remains active.  
- A selected type prevents selecting another type until cleared.

## 📁 File Structure
```
TU_Dresden/
│
├── assets/
│   └── cars.csv
│
├── photos/                # example photos of the scatter plot
│   ├── 1.png    
│   ├── 2.png
│   ├── 3.png
│   └── sketch.png
│
├── src/
│   ├── data_utils.js      # data loading & preprocessing helpers
│   ├── scatterplot.js     # D3 scatterplot & interactions
│   └── main.js            # main function
│
├── d3.v5.min.js           # external D3.js library
├── index.html             # main HTML file
├── style.css              # styling for the visualization
├── .gitignore
└── README.md
```

## Acknowledgements & Resources
Resources used during implementation:

- Gapminder bubble chart for concept and inspiration  
  https://www.gapminder.org/tools/

- CSV reading  
  https://www.tutorialsteacher.com/d3js/loading-data-from-file-in-d3js

- Basic scatter plot  
  https://d3-graph-gallery.com/graph/scatter_basic.html

- Bubble size & color mapping  
  https://d3-graph-gallery.com/graph/bubble_tooltip.html

- Guide line (crosshair) reference  
  https://geeksta.net/js-drawing/svg-crosshairs/

- Zooming interaction  
  https://d3-graph-gallery.com/graph/interactivity_zoom.html#axisZoom

- Tooltip interaction  
  https://d3-graph-gallery.com/graph/scatter_tooltip.html

- D3 selection mechanics  
  https://d3js.org/d3-selection/selecting

### AI Assistance
ChatGPT assisted with bug fix, logic design, and general development guidance.

## Local development: 
Pre-requisite: [Node.js](https://nodejs.org/en). Install `serve` using: 
> npm install serve --global 

And start the application using 
> serve -p 8000 

You should then be able to see your website at [http://localhost:8000](http://localhost:8000). 

*Note:* feel free to explore other development environments such as [Vite](https://vite.dev/), [Flask (python)](https://flask.palletsprojects.com/en/stable/), etc. 

## Debugging: 
Feel free to make extensive use of your browser's development tools! 
In chrome-based browsers, you can simply use Ctrl+J to open the browser console, which will show all the `console.log` and similar that you write in the code. 