// Waiting until document has loaded
window.onload = async () => {

  console.log("main.js is running!");

  try {
    // Load the data set from the assets folder
    const rawData = await d3.csv("assets/cars.csv");
    const data = rawData.map(clearRawData);

    console.log("Loaded data:", data);
    console.log("Number of rows:", data.length);

    console.log(data.filter(d => d.City_Miles !== null).length + " cars have valid City_Miles values.");

    // Draw the scatterplot with the loaded data
    drawScatterplot(data);

  } catch (error) {
    console.error("Error loading or parsing cars.csv:", error);
  }
};