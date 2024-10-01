import R from "./ramda.js";

/**
 * Cyclic_Automata.js is a module to simulate cyclic cellular automata.
 * https://en.wikipedia.org/wiki/Cyclic_cellular_automaton
 * @namespace Cyclic_Automata
 * @author M.H.Chariwala
 * @version 2022
 */

const Cyclic_Automata = Object.create(null);

/**
 * Creates a new board of cells with randomised states.
 * Has default dimenions of 40x70 with 4 states.
 * @memberof Cyclic_Automata
 * @function
 * @param {number} [height = 40] Height of the board
 * @param {number} [width = 70] Width of the board
 * @param {number} [states = 4] Number of states
 * @returns {matrix} Board of cells with random states
 */
Cyclic_Automata.initial_board = function (height = 40, width = 70, states = 4) {
    const empty_board = empty_matrix(height, width);
    const start_matrix = randomise_board(empty_board, states);
    return start_matrix;
};

const empty_matrix = function (height, width) {
    const board = R.repeat(R.repeat(0, width), height);
    return board;
};

const randomise_board = function (board, states) {
    const empty_board = board;
    const curried_random = random_number_generator(states);
    const new_board = R.map(R.map(curried_random), empty_board);
    return new_board;
};

const random_number_generator = function (states) {
    return function (x) {
        const number = x + Math.floor(Math.random() * states);
        return number;
    };
};

/**
 * Function to take multiple steps at once.
 * @memberof Cyclic_Automata
 * @function
 * @param {number} [n] Number of steps to be taken
 * @param {array} [neighbourhood] List of the cells to be used as the neighbourhood
 * @param {number} [threshold] Minimum number of cells one-step evolved in the neighbourhood to cause current cell to evolve
 * @param {number} [states] Number of states
 * @param {number} [padding] Padding applied to baord (dependant on neighbourhood grid size)
 * @param {matrix} [board] Current board needing to be updated
 * @returns {matrix} Updated board with evolved cells
 */
Cyclic_Automata.recursive_steps = function (n, neighbourhood, threshold, states, padding, board) {
    const step = Cyclic_Automata.single_step(neighbourhood, threshold, states, padding)(board);
    if (n === 1) {
        return step
    } else {
        return Cyclic_Automata.recursive_steps(n-1, neighbourhood, threshold, states, padding, step)
    }
}

/**
 * Function to update the board once.
 * @memberof Cyclic_Automata
 * @function
 * @param {array} [neighbourhood] List of the indices of cells to be used as the neighbourhood
 * @param {number} [threshold] Minimum number of cells one-step evolved in the neighbourhood to cause current cell to evolve
 * @param {number} [states] Number of states
 * @param {number} [padding] Padding applied to baord (dependant on neighbourhood grid size)
 * @param {matrix} [board] Current board needing to be updated
 * @returns {matrix} Updated board with evolved cells
 */
Cyclic_Automata.single_step = function (neighbourhood, threshold, states, padding) {
    return function (board) {
        const curried_cell_state = Cyclic_Automata.compute_cell_state(neighbourhood, threshold, states, padding)
        const previous_board = board;
        const padded_board = Cyclic_Automata.recursion_padding(padding, previous_board);
        return map_element_with_index((function (row, row_index) {
            return map_element_with_index((function (value, column_index) {
                return curried_cell_state(row_index, column_index, board, padded_board)
            }), row)
        }), board)
    }
}

Cyclic_Automata.recursion_padding = function (n, board) {
    const updated_board = add_padding_once(board);
    if (n === 1) {
        return updated_board;
    } else {
    return Cyclic_Automata.recursion_padding(n-1, updated_board);
    }
};

const add_padding_once = function (board) {
    const padded1 = vertical_padding(board);
    const padded2 = horizontal_padding(padded1);
    const padded_board = padded2;
    return padded_board;
};

const vertical_padding = function (board) {
    const width = R.length(board[0]);
    const padding = R.repeat(-1, width);
    const top_padding = R.prepend(padding, board);
    const bottom_padding = R.append(padding, top_padding);
    const fully_padded = bottom_padding;
    return fully_padded;
};

const horizontal_padding = function (board) {
    const left_padding = R.map(R.prepend(-1), board);
    const right_padding = R.map(R.append(-1), left_padding);
    const fully_padded = right_padding;
    return fully_padded;
};

const map_element_with_index = R.addIndex(R.map);


/**
 * Function to determine whether or not a cell should evolve.
 * @memberof Cyclic_Automata
 * @function
 * @param {array} [neighbourhood] List of the indices of cells to be used as the neighbourhood
 * @param {number} [threshold] Minimum number of cells one-step evolved in the neighbourhood to cause current cell to evolve
 * @param {number} [states] Number of states
 * @param {number} [padding] Padding applied to baord (dependant on neighbourhood grid size)
 * @param {number} [row] Index of the row being observed
 * @param {number} [column] Index of the column being observed
 * @param {matrix} [board] Current board needing to be updated
 * @param {matrix} [padded_board] Current board with padding applied
 * @returns {number} New state of the cell (either unchanged or one-step evolved)
 */
Cyclic_Automata.compute_cell_state = function (neighbourhood, threshold, states, padding) {
    return function (row, column, board, padded_board) {
        const current_state = get_cell_state(row, column, board);
        const list_of_states = Cyclic_Automata.neighbouring_states(row + padding, column + padding, padded_board, neighbourhood, padding);
        const state_counter = higher_state_counter(current_state, list_of_states, states);
        const update_needed = threshold_comparator(state_counter, threshold);
        const new_state = new_cell_state(current_state, update_needed, states);
    return new_state;
    }
}

const get_cell_state = function (row, column, board) {
    const cell_state = board[row][column];
    return cell_state;
}

const higher_state_counter = function (current_state, neighbours_list, states) {
    const filtered_list = R.filter(function (n) {
        if (n - current_state === 1) {
            return true
        } else if (current_state + 1 === states && n === 0) {
            return true
        } else {
            return false
        }
    }, neighbours_list)
    const advanced_cell_num = R.length(filtered_list);
    return advanced_cell_num
}

const threshold_comparator = function (number, threshold) {
    if (number >= threshold) {
        return true
    } else { return false }
}

const new_cell_state = function (current, boolean, states) {
    if (boolean === false) {
        return current
    } else {
        if (states - current === 1) {
            return 0
        } else {
            return current + 1
        }
    }
}

/**
 * Function to return cell states in the neighbourhood of a given cell on the padded board.
 * @memberof Cyclic_Automata
 * @function
 * @param {number} [row] Index of the row being observed
 * @param {number} [column] Index of the column being observed
 * @param {matrix} [padded_board] Current board with padding applied
 * @param {array} [neighbourhood] List of the indices of cells to be used as the neighbourhood
 * @param {number} [centre_offset] x and y index of referance cell on neighbourhood grid (= padding)
 * @returns {array} List of the states of cells in the neighbourhood
 */
Cyclic_Automata.neighbouring_states = function (row, column, padded_board, neighbourhood, centre_offset) {
    const curried_coordinates = get_coordinates(centre_offset)
    const current_board = padded_board;
    const coordinates_list = curried_coordinates(neighbourhood);
    if (get_cell_state(row, column, current_board) === -1) {
        return -1
    } else {
        return R.map((function (array) {
            const [a, b] = array
            const state = get_cell_state(row + a, column + b, current_board)
            return state
        }), coordinates_list)
    }
}

const get_coordinates = function (centre_offset) {
    return function (number_neighbourhood) {
        return R.map((function (array) {
            const [a, b] = array
            return [a - centre_offset, b - centre_offset]
        }), number_neighbourhood)
    }
}

const add_tokens = function (board) {
    return R.map(function (row) {
        return R.map(function (value) {
            if (value === 0) {
                return "🟥"
            } else if (value === 1) {
                return "🟧"
            } else if (value === 2) {
                return "🟨"
            }
        }, row)
    }, board)
}

Cyclic_Automata.prepare_neighbourhood = function (board) {
    const board_with_indices = map_element_with_index(function (row, row_index) {
        return map_element_with_index(function (value, column_index) {
            if (value === 1) {
                return [row_index, column_index]
            } else { return -1 }
        }, row)
    }, board)
    const filtered = R.map(function (row) {
        return R.filter((x) => x !== -1, row)
    }, board_with_indices)
    const list = R.unnest(filtered)
    return list
}

const van_neumann_neighbourhood = [[2, 3], [3, 4], [4, 3], [3, 2]]
const moore_neighbourhood = [[2, 2], [2, 3], [2, 4], [3, 2], [3, 4], [4, 2], [4, 3], [4, 4]]

const test_board = Cyclic_Automata.initial_board(100,60,3)

export default Object.freeze(Cyclic_Automata);