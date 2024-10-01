import R from "./ramda.js";

// I wrote these helper functions to deal with generating the colours for the board
// I wanted to be able to have at least 10 states, this approach allows for 49
// My initial approach was to hard code these states using css properties
// However, there were three main problems with this issue:
// - Efficiency: hard coding these states took a lot of space and was highly inefficient
// - Tinkering: hard coding meant that if I wanted to change te colour scheme, 
// I would have to manually change each colour one-by-one
// - Contrast: hard coding the states meant that colour change between each 
// step was minor, such that when all the states were used, an aesthetically pleasing 
// gradient would be established. However, this meant that generating a grid with say 4 states 
// would result in very little contrast, making it difficult to appreciate the simulator

const Colour_Scheme = Object.create(null);

const generate_original_colours = function (highest, middle, lowest) {
    let colours_array = [];
    colours_array.push([lowest, highest, lowest]);
    colours_array.push([lowest, highest, middle]);
    colours_array.push([lowest, highest, highest]);
    colours_array.push([lowest, middle, highest]);
    colours_array.push([lowest, lowest, highest]);
    colours_array.push([middle, lowest, highest]);
    colours_array.push([middle, lowest, middle]);
    return colours_array
}


const find_new_colours = function (original_colours) {
    let colours_array = [[],[],[]]
    const flipped = R.transpose(original_colours)
    flipped.forEach(function (row, row_index) {
        row.forEach(function (value, column_index) {
            colours_array[row_index].push(value)
            if (column_index < (R.length(original_colours) - 1)) {
                const next_value = flipped[row_index][column_index + 1]
                colours_array[row_index].push(Math.floor((value + next_value) / 2))
            }
        })
    })
    return R.transpose(colours_array)
}


Colour_Scheme.create_colour_scheme = function (highest, middle, lowest, states) {
    const original = generate_original_colours(highest, middle, lowest);
    const step_1 = find_new_colours(original);
    const step_2 = find_new_colours(step_1);
    const step_3 = find_new_colours(step_2);
    if (states > 7) {
        if (states < 14) {
            return step_1
        } else if (states < 26) {
            return step_2
        } else if (states < 50) {
            return step_3
        }
    } else {return original}
}

export default Object.freeze(Colour_Scheme);