// Check if the value is boolean, else return null
function bool_check(value) {
  if (value === null) return null;

  const trimmed = String(value).trim().toUpperCase();
  if (trimmed === "1" || trimmed === "TRUE") return true;
  if (trimmed === "0" || trimmed === "FALSE") return false;

  return null;
}

// Check if the value is number, else return null 
function num_check(value, min = 0, max = Infinity) {
  if (value === null) return null;

  const trimmed = String(value).trim();
  if (trimmed === "" || trimmed.toUpperCase() === "NA") return null;

  const number = +trimmed;
  if (Number.isNaN(number)) return null;

  if (number <= min || number >= max) return null;

  return number;
}

// Check if the value is string, else return null
function str_check(value) {
  if (value === null) return null;

  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

// Clean the raw data
function clearRawData(d) {
  return {
    Name: str_check(d["Name"]),
    Type: str_check(d["Type"]),

    AWD: bool_check(d["AWD"]),
    RWD: bool_check(d["RWD"]),

    Retail_Price: num_check(d["Retail Price"]),
    Dealer_Cost: num_check(d["Dealer Cost"]),

    Engine_Size: num_check(d["Engine Size (l)"], 0, 10), 
    Cyl: num_check(d["Cyl"]),
    Horsepower: num_check(d["Horsepower(HP)"]),

    City_Miles: num_check(d["City Miles Per Gallon"], 0, 100),
    Highway_Miles: num_check(d["Highway Miles Per Gallon"]),

    Weight: num_check(d["Weight"]),
    Wheel_Base: num_check(d["Wheel Base"]),
    Len: num_check(d["Len"]),
    Width: num_check(d["Width"])
  };
} 