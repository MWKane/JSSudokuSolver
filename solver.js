'use strict';


// Map where boxMap[cell id] = cell.box
const boxMap = [,,,,,,,,,,,
	1,1,1,2,2,2,3,3,3,,1,1,1,2,2,2,3,3,3,,1,1,1,2,2,2,3,3,3,,
	4,4,4,5,5,5,6,6,6,,4,4,4,5,5,5,6,6,6,,4,4,4,5,5,5,6,6,6,,
	7,7,7,8,8,8,9,9,9,,7,7,7,8,8,8,9,9,9,,7,7,7,8,8,8,9,9,9
];


function _Cell(game = new _Game(), id = '', value = 0) {
	// `id` is in the form of '{row}{column}' - ie: first cell would be '11'

	if (!id) {
		console.error(`_Cell() Given invalid cell id: ${id}`);
		return;
	};

	// ===============
	// Cell Properties
	// ===============
	this.game = game;
	this.id = id;
	this.row = parseInt(id[0]);
	this.col = parseInt(id[1]);
	this.box = boxMap[parseInt(id)];
	// cell.value and cell.candidates need to be in sync, use the helper function to set the value
	this.value = value;
	// An important feature is that candidate arrays are always sorted lowest to highest
	// Therefore cells with identical available candidates will have identical cell.candidates
	this.candidates = value ? [value] : [1, 2, 3, 4, 5, 6, 7, 8, 9];

	// ==================
	// Solving Properties
	// ==================
	
	// Used in _Game.Solving.chain, _Game.Solving.xcycle and _Game.Solving.medusa
	this.simpleState = null;
	// Used in _Game.Solving.xcycle
	this.hasWeak = false;
	// Used in _Game.Solving.medusa
	this.complexState = {
		1: null,
		2: null,
		3: null,
		4: null,
		5: null,
		6: null,
		7: null,
		8: null,
		9: null
	};

	// =====================
	// Cell Functions
	// =====================

	this.validate = (value) => {
		let valid = true;

		// One value per cell
		if (this.value == value) return true;
		if (this.value) return false;

		// Validate Row
		this.game.forEachCellOfRows(this.row, cell => {
			if (cell.value == value) valid = false;
		});

		// Validate Column
		this.game.forEachCellOfCols(this.col, cell => {
			if (cell.value == value) valid = false;
		});

		// Validate Box
		this.game.forEachCellOfBoxs(this.box, cell => {
			if (cell.value == value) valid = false;
		});

		return valid;
	};

	this.generateCandidates = () => {
		if (this.value) return;

		// We only remove from the existing candidate list to not undo our solving work
		// [...this.candidates] so we are not modifying the array we are iterating
		for (const candidate of [...this.candidates]) {
			if (!this.validate(candidate)) this.removeCandidate(candidate);
		};

		return this.candidates;
	};

	// =============================
	// Solving Fundamental Functions
	// =============================

	this.sees = (cell) => {
		// Check if `this` sees `cell`
		if (cell) return (cell.row == this.row || cell.col == this.col || cell.box == this.box);

		let cells = [];
		this.game.forEachCell(tCell => {
			if (this.row == tCell.row || this.col == tCell.col || this.box == tCell.box) cells.push(tCell);
		});

		return cells;
	};

	this.strong = (candidate, cell) => {
		// Check if `this` has a strong link with `cell` on `candidate`

		if (this.id == cell.id) return false;
		if (!cell.candidates.includes(candidate)) return false;

		if (this.row == cell.row) return this.game.containsCandidates(candidate, this.row).length == 2;
		if (this.col == cell.col) return this.game.containsCandidates(candidate, 0, this.col).length == 2;
		if (this.box == cell.box) return this.game.containsCandidates(candidate, 0, 0, this.box).length == 2;
		return false;

		// Code to get all strongly linked cells
		//let linked = [];
		//let rCells = this.containsCandidate(candidate, this.row);
		//if (rCells.length == 2) linked.push(rCells.find(cell => cell.id != this.id));
		//let cCells = this.containsCandidate(candidate, 0, this.col);
		//if (cCells.length == 2) linked.push(cCells.find(cell => cell.id != this.id));
		//let bCells = this.containsCandidate(candidate, 0, 0, this.box);
		//if (bCells.length == 2) linked.push(bCells.find(cell => cell.id != this.id));
		//return linked;
	};

	this.weak = (candidate, cell) => {
		// Check if `this` has a weak link with `cell` on `candidate`

		if (this.id == cell.id) return false;
		if (!cell.candidates.includes(candidate)) return false;

		return this.sees(cell) && !this.strong(candidate, cell);
	};

	// ================
	// Helper Functions
	// ================

	this.setValue = value => {
		if (this.candidates.indexOf(value) == -1 || !this.validate(value)) 
			console.warn(`_Cell(${this.id}).value set to ${value} - not in candidate list (${this.candidates})`);

		this.value = value;
		this.candidates = [value];
	};

	this.removeCandidate = candidate => {
		let index = this.candidates.indexOf(candidate);
		if (index == -1) return;
		this.candidates.splice(index, 1);

		return this.candidates;
	};
};

function _Game(string = '000000000000000000000000000000000000000000000000000000000000000000000000000000000') {
	if (!string || string.length != 81) {
		console.error(`_Game() Given invalid grid string: ${string}`);
		return;
	};

	// ===============
	// Grid Properties
	// ===============

	let v = string.split('').map(char => parseInt(char));
	this.grid = [
		,
		[, new _Cell(this, '11', v[ 0]), new _Cell(this, '12', v[ 1]), new _Cell(this, '13', v[ 2]), new _Cell(this, '14', v[ 3]), new _Cell(this, '15', v[ 4]), new _Cell(this, '16', v[ 5]), new _Cell(this, '17', v[ 6]), new _Cell(this, '18', v[ 7]), new _Cell(this, '19', v[ 8])],
		[, new _Cell(this, '21', v[ 9]), new _Cell(this, '22', v[10]), new _Cell(this, '23', v[11]), new _Cell(this, '24', v[12]), new _Cell(this, '25', v[13]), new _Cell(this, '26', v[14]), new _Cell(this, '27', v[15]), new _Cell(this, '28', v[16]), new _Cell(this, '29', v[17])],
		[, new _Cell(this, '31', v[18]), new _Cell(this, '32', v[19]), new _Cell(this, '33', v[20]), new _Cell(this, '34', v[21]), new _Cell(this, '35', v[22]), new _Cell(this, '36', v[23]), new _Cell(this, '37', v[24]), new _Cell(this, '38', v[25]), new _Cell(this, '39', v[26])],
		[, new _Cell(this, '41', v[27]), new _Cell(this, '42', v[28]), new _Cell(this, '43', v[29]), new _Cell(this, '44', v[30]), new _Cell(this, '45', v[31]), new _Cell(this, '46', v[32]), new _Cell(this, '47', v[33]), new _Cell(this, '48', v[34]), new _Cell(this, '49', v[35])],
		[, new _Cell(this, '51', v[36]), new _Cell(this, '52', v[37]), new _Cell(this, '53', v[38]), new _Cell(this, '54', v[39]), new _Cell(this, '55', v[40]), new _Cell(this, '56', v[41]), new _Cell(this, '57', v[42]), new _Cell(this, '58', v[43]), new _Cell(this, '59', v[44])],
		[, new _Cell(this, '61', v[45]), new _Cell(this, '62', v[46]), new _Cell(this, '63', v[47]), new _Cell(this, '64', v[48]), new _Cell(this, '65', v[49]), new _Cell(this, '66', v[50]), new _Cell(this, '67', v[51]), new _Cell(this, '68', v[52]), new _Cell(this, '69', v[53])],
		[, new _Cell(this, '71', v[54]), new _Cell(this, '72', v[55]), new _Cell(this, '73', v[56]), new _Cell(this, '74', v[57]), new _Cell(this, '75', v[58]), new _Cell(this, '76', v[59]), new _Cell(this, '77', v[60]), new _Cell(this, '78', v[61]), new _Cell(this, '79', v[62])],
		[, new _Cell(this, '81', v[63]), new _Cell(this, '82', v[64]), new _Cell(this, '83', v[65]), new _Cell(this, '84', v[66]), new _Cell(this, '85', v[67]), new _Cell(this, '86', v[68]), new _Cell(this, '87', v[69]), new _Cell(this, '88', v[70]), new _Cell(this, '89', v[71])],
		[, new _Cell(this, '91', v[72]), new _Cell(this, '92', v[73]), new _Cell(this, '93', v[74]), new _Cell(this, '94', v[75]), new _Cell(this, '95', v[76]), new _Cell(this, '96', v[77]), new _Cell(this, '97', v[78]), new _Cell(this, '98', v[79]), new _Cell(this, '99', v[80])],
	];

	// Flat grid of cells from 0-80
	this.cells = this.grid.flatMap(arr => arr.filter(cell => cell));

	// Next step in the solution will be stored here
	// Format is based on solution.name
	this.solution = null;

	// ===================
	// Iterative Functions
	// ===================

	this.forEachCell = (fn = (cell = new _Cell()) => {}) => {
		for (let row = 1; row <= 9; row++) {
			for (let col = 1; col <= 9; col++) {
				fn(this.grid[row][col]);
			};
		};
	};

	this.forEachCellOfRows = (rows, fn = (cell = new _Cell(), row = 0)) => {
		if (!Array.isArray(rows)) rows = [rows];
		for (const row of rows) {
			for (let col = 1; col <= 9; col++) fn(this.grid[row][col], row);
		};
	};

	this.forEachCellOfCols = (cols, fn = (cell = new _Cell(), col = 0)) => {
		if (!Array.isArray(cols)) cols = [cols];
		for (const col of cols) {
			for (let row = 1; row <= 9; row++) fn(this.grid[row][col], col);
		};
	};

	this.forEachCellOfBoxs = (boxs, fn = (cell = new _Cell(), box = 0)) => {
		if (!Array.isArray(boxs)) boxs = [boxs];
		let ids = boxMap.map((box, id) => id).filter((id, index) => boxs.includes(boxMap[index]));
		

		ids.forEach(id => {
			fn(this.cellFromId(id), boxMap[id]);
		});
	};

	this.forEachRow = (fn = (cells = [], row = 0) => {}) => {
		for (let row = 1; row <= 9; row++) {
			let cells = [];
			for (let col = 1; col <= 9; col++) cells.push(this.grid[row][col]);
			fn(cells, row);
		};
	};

	this.forEachCol = (fn = (cells = [], col = 0) => {}) => {
		for (let col = 1; col <= 9; col++) {
			let cells = [];
			for (let row = 1; row <= 9; row++) cells.push(this.grid[row][col]);
			fn(cells, col);
		};
	};

	this.forEachBox = (fn = (cells = [], box = 0) => {}) => {
		for (let box = 1; box <= 9; box++) {
			let ids = boxMap.map((b, id) => id).filter((id, index) => boxMap[index] == box);
			fn(ids.map(id => this.cellFromId(id)), box);
		};
	};

	// ==============
	// Grid Functions
	// ==============
	
	this.cellFromId = (id) => {
		let idStr = String(id);
		return this.grid[idStr[0]][idStr[1]];
	};

	(this.generateCandidates = () => {
		// Self-invoke to generate candidates at init
		this.forEachCell(cell => cell.generateCandidates());
	})();

	// =============================
	// Solving Fundamental Functions
	// =============================

	this.containsCandidates = (candidates, row = 0, col = 0, box = 0, exact = false, every = false, exclusive = false) => {
		// This funtion is the back-bone of the solver
		// Finds all cells within the given house overlap that can contain `candidates`
		// Excludes cells with a set value

		let cells = [];
		if (!Array.isArray(candidates)) candidates = [candidates];

		function getCells(cell) {
			if (cell.value) return;
			if (row && cell.row != row) return;
			if (col && cell.col != col) return;
			if (box && cell.box != box) return;

			// Has four modes:

			// EXACT: cells must contain EXACTly and only `[candidates]` ie: [1,2] = [1,2]
			if (exact && candidates.equals(cell.candidates)) cells.push(cell);
			if (exact) return;

			// EVERY: cells must contain EVERY `[candidates]`, with extras allowed ie: [1,2] = [1,2,3]
			if (every && candidates.every(c => cell.candidates.includes(c))) cells.push(cell);
			if (every) return;

			// EXCLUSIVE: cells must contain at least one `[candidates]`, but no extras ie: [1,2] = [2]
			if (exclusive && cell.candidates.every(c => candidates.includes(c))) cells.push(cell);
			if (exclusive) return;

			// DEFAULT: cells must contain at least one `[candidates]` ie: [1,2] = [1,8,9]
			if (candidates.some(c => cell.candidates.includes(c))) cells.push(cell);
		};


		if (row) this.forEachCellOfRows(row, getCells);
		if (col) this.forEachCellOfCols(col, getCells);
		if (box) this.forEachCellOfBoxs(box, getCells);
		if (!row && !col && !box) this.forEachCell(getCells);


		return [... new Set(cells)];
	};

	this.intersection = (eyes = [], excl = false) => {
		// Get all cells that are seen by every cell in `eyes`
		// `excl`ude the cells that make up the `eyes`

		// Get all cells seen by the first eye
		// Filter if all eyes see the cell
		let intersect = eyes[0].sees().filter(cell => eyes.every(eye => eye.sees(cell)));

		if (!excl) return intersect
		else return intersect.filter(cell => !eyes.cellIds().includes(cell.id));
	};

	// =================
	// Solving Functions
	// =================

	this.singles = () => {
		// Finds all naked/hidden singles at once
		// Made to reduce number of steps to solve each puzzle


		function _Singles(cells, singles, changes) {
			this.name = 'SINGLES';

			// [_Cell, ...]
			this.cells = cells || [];

			// [[_Cell, 'HIDDEN/NAKED', CANDIDATE, 'ROW/COL/BOX', HOUSE], ...]
			this.singles = singles || [];

			// [[_Cell, value, candidates], ...]
			this.changes = changes || [];
		};


		let _r = new _Singles([], []);

		// Find all cells with a single candidate (NAKED SINGLES)
		this.forEachCell(cell => {
			if (cell.value) return;
			if (cell.candidates.length == 1) {
				_r.cells.push(cell)
				_r.singles.push([cell, 'NAKED', cell.candidates[0], null, null]);
				_r.changes.push([cell, cell.candidates[0], cell.candidates]);
			};
		});

		// Find all candidates with only one cell for a house (HIDDEN SINGLES)
		for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
			for (const house of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
				let rCells = this.containsCandidates(candidate, house);
				if (rCells.length == 1) {
					let cell = rCells[0];
					if (!_r.cells.cellIds().includes(cell.id)) {
						_r.cells.push(cell);
						_r.singles.push([cell, 'HIDDEN', candidate, 'ROW', house]);
						_r.changes.push([cell, candidate, [candidate]]);
					};
				};

				let cCells = this.containsCandidates(candidate, 0, house);
				if (cCells.length == 1) {
					let cell = cCells[0];
					if (!_r.cells.cellIds().includes(cell.id)) {
						_r.cells.push(cell);
						_r.singles.push([cell, 'HIDDEN', candidate, 'COL', house]);
						_r.changes.push([cell, candidate, [candidate]]);
					};
				};

				let bCells = this.containsCandidates(candidate, 0, 0, house);
				if (bCells.length == 1) {
					let cell = bCells[0];
					if (!_r.cells.cellIds().includes(cell.id)) {
						_r.cells.push(cell);
						_r.singles.push([cell, 'HIDDEN', candidate, 'BOX', house]);
						_r.changes.push([cell, candidate, [candidate]]);
					};
				};
			};
		};

		if (_r.changes.length) return _r;
		else return null;
	};

	this.tuple = (n = 1) => {
		// Iterate all houses looking for tuples of n digits in n cells.
		// Finds first actionable tuple


		function _Tuple(cells, tuple, changes, type, house, houseType) {
			this.name = 'TUPLE';
			this.class = [, 'SINGLE', 'PAIR', 'TRIPLE', 'QUAD'][n];

			// [_Cell, _Cell, ...] (n cells)
			this.cells = cells || [];

			// [x, y, ...] (n candidates)
			this.tuple = tuple || [];

			// [[_Cell(), value, candidates], [_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// 'NAKED'/'HIDDEN'
			this.type = type || '';

			// 0-9
			this.house = house || 0;

			// 'ROW'/'COL'/'BOX'
			this.houseType = houseType|| '';
		};
		

		// Get all candidate combinations of n digits
		// n = 1: 9 combos
		// n = 2: 36 combos
		// n = 3: 84 combos
		// n = 4: 126 combos
		for (const tuple of Math.combinations(9, n, 1)) {
			// Iterate through every house
			for (const house of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {

				// ====
				// ROWS
				// ====

				// Find all naked tuple possibilities in row `house`
				// The tuple candidates must be the only possible candidates in the cells
				let nrCells = this.containsCandidates(tuple, house, 0, 0, false, false, true);
				if (nrCells.length == n) {
					// ===========
					// NAKED TUPLE
					// ===========

					// Create our _Tuple return object - we now only need to fill _r.changes
					let _r = new _Tuple(nrCells, tuple, [], 'NAKED', house, 'ROW');

					if (n == 1) {
						// Naked single; change the cell's value to the sole tuple candidate
						_r.changes.push([nrCells[0], tuple[0], tuple]);
					} else {
						// Otherwise remove all tuple candidates from every other cell in the house
						this.forEachCellOfRows(house, cell => {
							// Filter out the cells in our tuple
							if (nrCells.cellIds().includes(cell.id)) return;

							// Filter out the tuple from cell candidates
							let candidates = cell.candidates.filter(c => !tuple.includes(c));
							if (!candidates.equals(cell.candidates)) {
								// Remove all candidates of our tuple from cell
								_r.changes.push([cell, null, candidates]);
							};
						});
					};

					// If our _Tuple instigated changes, return it
					if (_r.changes.length) return _r;
				};


				// Find all hidden tuple possibilities in row `house`
				// There must be non-tuple candidates in at least of the cells
				let hrCells = this.containsCandidates(tuple, house);
				if (
					// Must be a touple of n cells
					(hrCells.length == n)
					// Must contain some non-tuple candidates
					&& (hrCells.some(cell => cell.candidates.some(c => !tuple.includes(c))))
					// Must contain at least one of each tuple number
					&& (tuple.every(c => hrCells.some(cell => cell.candidates.includes(c))))
				) {
					// ============
					// HIDDEN TUPLE
					// ============

					// Create our _Tuple return object - we now only need to fill _r.changes
					let _r = new _Tuple(hrCells, tuple, [], 'HIDDEN', house, 'ROW');

					if (n == 1) {
						// Hidden single; change the cell's value to the sole tuple candidate
						_r.changes.push([hrCells[0], tuple[0], tuple]);
					} else {
						// Otherwise remove all non-tuple candidates from hrCells
						hrCells.forEach(cell => {
							// Filter the cell candidates so only our tuple remains
							let candidates = cell.candidates.filter(c => tuple.includes(c));
							if (!candidates.equals(cell.candidates)) {
								// Remove all non-tuple candidates
								_r.changes.push([cell, null, candidates])
							};
						});
					};

					// We know this tuple instigated changes because hidden tuples must contain non-tuple candidates
					return _r;
				};

				// Repeat the above for columns and boxes:


				// =======
				// COLUMNS
				// =======

				let ncCells = this.containsCandidates(tuple, 0, house, 0, false, false, true);
				if (ncCells.length == n) {
					// ===========
					// NAKED TUPLE
					// ===========

					// The only difference is, we no longer need to check for naked singles
					// As if they existed they would be found via row
					if (n == 1) continue;

					let _r = new _Tuple(ncCells, tuple, [], 'NAKED', house, 'COL');
					this.forEachCellOfCols(house, cell => {
						if (ncCells.cellIds().includes(cell.id)) return;

						let candidates = cell.candidates.filter(c => !tuple.includes(c));
						if (!candidates.equals(cell.candidates)) {
							_r.changes.push([cell, null, candidates]);
						};
					});
					if (_r.changes.length) return _r;
				};

				let hcCells = this.containsCandidates(tuple, 0, house);
				if (
					(hcCells.length == n)
					&& (hcCells.some(cell => cell.candidates.some(c => !tuple.includes(c))))
					&& (tuple.every(c => hcCells.some(cell => cell.candidates.includes(c))))
				) {
					// ============
					// HIDDEN TUPLE
					// ============

					let _r = new _Tuple(hcCells, tuple, [], 'HIDDEN', house, 'COL');

					if (n == 1) {
						_r.changes.push([hcCells[0], tuple[0], tuple]);
					} else {
						hcCells.forEach(cell => {
							let candidates = cell.candidates.filter(c => tuple.includes(c));
							if (!candidates.equals(cell.candidates)) {
								_r.changes.push([cell, null, candidates])
							};
						});
					};

					return _r;
				};

				// =====
				// BOXES
				// =====

				let nbCells = this.containsCandidates(tuple, 0, 0, house, false, false, true);
				if (nbCells.length == n) {
					// ===========
					// NAKED TUPLE
					// ===========

					// The only difference is, we no longer need to check for naked singles
					// As if they existed they would be found via row
					if (n == 1) continue;

					let _r = new _Tuple(nbCells, tuple, [], 'NAKED', house, 'BOX');
					this.forEachCellOfBoxs(house, cell => {
						if (nbCells.cellIds().includes(cell.id)) return;

						let candidates = cell.candidates.filter(c => !tuple.includes(c));
						if (!candidates.equals(cell.candidates)) {
							_r.changes.push([cell, null, candidates]);
						};
					});
					if (_r.changes.length) return _r;
				};

				let hbCells = this.containsCandidates(tuple, 0, 0, house);
				if (
					(hbCells.length == n)
					&& (hbCells.some(cell => cell.candidates.some(c => !tuple.includes(c))))
					&& (tuple.every(c => hbCells.some(cell => cell.candidates.includes(c))))
				) {
					// ============
					// HIDDEN TUPLE
					// ============

					let _r = new _Tuple(hbCells, tuple, [], 'HIDDEN', house, 'BOX');

					if (n == 1) {
						_r.changes.push([hbCells[0], tuple[0], tuple]);
					} else {
						hbCells.forEach(cell => {
							let candidates = cell.candidates.filter(c => tuple.includes(c));
							if (!candidates.equals(cell.candidates)) {
								_r.changes.push([cell, null, candidates])
							};
						});
					};

					return _r;
				};
			};
		};

		return null;
	};

	this.pointing = () => {
		// Iterate each box finding a single row/column that contains all instances of a candidate
		// Finds first actionable pointing pair/triple
		// This is similar to _Game.Solving.lineReduction


		function _Pointing(cells, changes, candidate, box) {
			this.name = 'POINTING';
			this.class = [,,'PAIR', 'TRIPLE'][cells.length];

			// [_Cell, _Cell, (_Cell - only if TRIPLE)]
			this.cells = cells || [];

			// [[_Cell(), value, candidates], [_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// 0-9
			this.candidate = candidate || 0;
			
			// 0-9
			this.box = box || 0;
		};


		for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8,9 ]) {
			for (const box of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
				// Get all cells in `box` with `candidate`
				let cells = this.containsCandidates(candidate, 0, 0, box);


				// Check if they're in the same row
				// NOTE: `cells` can be an empty array
				let row = cells.length ? cells[0].row : 0;
				if (cells.length && cells.every(cell => cell.row == row)) {
					// ===================
					// POINTING PAIR (ROW)
					// ===================

					let _r = new _Pointing(cells, [], candidate, box);

					// Find every cell with `candidate` in `row` (except our pointing cells)
					let conflicts = this.containsCandidates(candidate, row).filter(cell => cell.box != box);

					// Check if we have any cells to change
					if (conflicts.length) {
						// Remove `candidate` from all conflicting cells
						conflicts.forEach(cell => _r.changes.push([cell, null, cell.candidates.remove(candidate)]));
						return _r;
					};
				};

				// Repeat for column:

				let col = cells.length ? cells[0].col : 0;
				if (cells.length && cells.every(cell => cell.col == col)) {
					// ===================
					// POINTING PAIR (COL)
					// ===================

					let _r = new _Pointing(cells, [], candidate, box);

					// Find every cell with `candidate` in `row` (except our pointing cells)
					let conflicts = this.containsCandidates(candidate, 0, col).filter(cell => cell.box != box);

					// Check if we have any cells to change
					if (conflicts.length) {
						// Remove `candidate` from all conflicting cells
						conflicts.forEach(cell => _r.changes.push([cell, null, cell.candidates.remove(candidate)]));
						return _r;
					};
				};
			};
		};

		return null;
	};

	this.lineReduction = () => {
		// Iterate each row/col (line) finding a single box that contains all instances of a candidate
		// Finds the first actionable line reduction.
		// This is similar to _Game.Solving.pointing


		function _Reduction(cells, changes, candidate, box) {
			this.name = 'LINEREDUCTION';
			this.class = [,,'PAIR', 'TRIPLE'][cells.length];

			// [_Cell, _Cell, (_Cell - only if TRIPLE)]
			this.cells = cells || [];

			// [[_Cell(), value, candidates], [_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// 0-9
			this.candidate = candidate || 0;
			
			// 0-9
			this.box = box || 0;
		};


		for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
			for (const line of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {

				// Get all cells in row `line` with `candidate
				let rCells = this.containsCandidates(candidate, line);
				// Check if they're in the same box
				// NOTE: rCells can be an empty array
				let rBox = rCells.length ? rCells[0].box : 0;
				if (rCells.length && rCells.every(cell => cell.box == rBox)) {
					// ====================
					// LINE REDUCTION (ROW)
					// ====================

					let _r = new _Reduction(rCells, [], candidate, rBox);

					// Find every cell with `candidate` in `box` (except our line cells)
					let conflicts = this.containsCandidates(candidate, 0, 0, rBox).filter(cell => cell.row != line);
					// Check if we have any cells to change
					if (conflicts.length) {
						// Remove `candidate` from all conflicting cells
						conflicts.forEach(cell => _r.changes.push([cell, null, cell.candidates.remove(candidate)]));
						return _r;
					};
				};

				// Repeat for column:

				let cCells = this.containsCandidates(candidate, 0, line);
				let cBox = cCells.length ? cCells[0].box : 0;
				if (cCells.length && cCells.every(cell => cell.box == cBox)) {
					// ====================
					// LINE REDUCTION (COL)
					// ====================

					let _r = new _Reduction(cCells, [], candidate, cBox);

					let conflicts = this.containsCandidates(candidate, 0, 0, cBox).filter(cell => cell.col != line);
					if (conflicts.length) {
						conflicts.forEach(cell => _r.changes.push([cell, null, cell.candidates.remove(candidate)]));
						return _r;
					};
				};
			};
		};

		return null;
	};

	this.fish = (n) => {
		// Iterate all lines looking for a formation in which either:
		//	- cells in n rows exist in n columns
		//	- cells in n columns exist in n rows

		// All fish are also X-Cycles (_Game.Solving.xcycle)

		// Fish have 5 main types:
		// n = 1: Hidden Single (Basic - also covered in _Game.Solving.tuples)
		// n = 2: X-Wing (Tough)
		// n = 3: Swordfish (Tough)
		// n = 4: Jellyfish (Diabolical)
		// n = 5: Squirmbag (Esoteric)


		function _Fish(cells, changes, type, candidate) {
			this.name = 'FISH';
			this.class = [,'HIDDEN SINGLE', 'X-WING', 'SWORDFISH', 'JELLYFISH', 'SQUIRMBAG'][n];

			// [_Cell, _Cell, ...]
			this.cells = cells || [];

			// [[_Cell(), value, candidates], [_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// 'ROW'/'COL'
			this.type = type || '';

			// 0-9
			this.candidate = candidate || 0;
		};

		// Iterate through each candidate looking for fish
		for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
			// We will store all row/column tuples of n cells in these arrays
			let rTuples = [];
			let cTuples = [];

			// Gather all tuples of n or fewer cells
			for (const line of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
				// Get all cells with `candidate` in `line`
				let rCells = this.containsCandidates(candidate, line);
				let cCells = this.containsCandidates(candidate, 0, line);

				// If there's n or fewer (but not 0) cells in the line, push it to our tuple array
				if (rCells.length && rCells.length <= n) rTuples.push(rCells);
				if (cCells.length && cCells.length <= n) cTuples.push(cCells);
			};

			// There must be equal or greater tuples than n
			if (rTuples.length >= n) {
				// Get all index combinations of our tuples and iterate each one
				let rCombos = Math.combinations(rTuples.length, n);
				for (const combo of rCombos) {
					// Get all the cells that make up our prospective fish
					// `combo` elements are 1-indexed so we must subtract one to find out indexes
					let fish = combo.map(index => rTuples[index]).cFlat();

					// Get the unique columns of our fish
					let cols = [...new Set(fish.map(cell => cell.col))];

					// Test if it has n unique columns
					if (cols.length == n) {
						// ==========
						// FISH (ROW)
						// ==========

						let _r = new _Fish(fish, [], 'ROW', candidate);

						// Special case for hidden singles, our single fish cell must be `candidate`
						if (n == 1) _r.changes.push([fish[0], candidate, [candidate]]);

						// Iterate each column of our fish and remove `candidate` from non-fish cells
						this.forEachCellOfCols(cols, cell => {
							// Check if cell contains `candidate`
							if (!cell.candidates.includes(candidate)) return;
							// Check if cell is part of our fish
							if (fish.cellIds().includes(cell.id)) return;

							// Remove our candidate from the cell
							_r.changes.push([cell, null, cell.candidates.remove(candidate)]);
						});
						
						// Check if our fish instigated changes
						if (_r.changes.length) return _r;
					};
				};
			};

			// Repeat for columns:

			if (cTuples.length >= n) {
				let cCombos = Math.combinations(cTuples.length, n);
				for (const combo of cCombos) {
					// Get all the cells that make up our prospective fish
					// `combo` elements are 1-indexed so we must subtract one to find out indexes
					let fish = combo.map(index => cTuples[index]).cFlat();

					// Get the unique rows of our fish
					let rows = [...new Set(fish.map(cell => cell.row))];

					// Test if it has n unique rows
					if (rows.length == n) {
						// ==========
						// FISH (COL)
						// ==========

						let _r = new _Fish(fish, [], 'COL', candidate);

						// Iterate each row of our fish and remove `candidate` from non-fish cells
						this.forEachCellOfRows(rows, cell => {
							// Check if cell contains `candidate`
							if (!cell.candidates.includes(candidate)) return;
							// Check if cell is part of our fish
							if (fish.cellIds().includes(cell.id)) return;

							// Remove our candidate from the cell
							_r.changes.push([cell, null, cell.candidates.remove(candidate)]);
						});
						
						// Check if our fish instigated changes
						if (_r.changes.length) return _r;
					};
				};
			};
		};

		return null;
	};

	this.chain = () => {
		// Identify chains of conjugate pairs and apply the following
		// Starting from any position in the chain, give each candidate a true/false state
		//	1) Any cell that sees candidates of both states cannot contain that candidate
		//	2) If a state appears twice in any unit, that state is not the correct solution

		function _Chain(cells, cellStates, changes, rule, onState, candidate, chain) {
			this.name = 'CHAIN';

			// [_Cell, _Cell, ...]
			this.cells = cells || [];

			// [[_Cell, state], [_Cell, state], ...]
			this.cellStates = cellStates || [];

			// [[_Cell(), value, candidates], [_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// 1/2
			this.rule = rule || 0;

			// null/true/false
			this.onState = onState || null;

			// 0-9
			this.candidate = candidate || 0;

			// [[_Cell, _Cell], [_Cell, _Cell], ...]
			this.chain = chain || [];
		};

		
		// Iterate through all candidates
		for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
			// Find all conjugate pairs and store them in `pairs`
			let pairs = [];
			for (const house of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
				let rCells = this.containsCandidates(candidate, house);
				let cCells = this.containsCandidates(candidate, 0, house);
				let bCells = this.containsCandidates(candidate, 0, 0, house);

				if (rCells.length == 2) pairs.push(rCells);
				if (cCells.length == 2) pairs.push(cCells);
				if (bCells.length == 2) pairs.push(bCells);
			};


			// There can be multiple chains per candidate
			// So we iterate through the list of conjugates, removing pairs one chain at a time
			while (pairs.length) {
				let pair = pairs[0];

				// Reset all cells' states before we start assigning them
				this.forEachCell(cell => cell.simpleState = null);

				// Seed the chain by assigning states to the first pair
				setState(pair[0], true);
				setState(pair[1], false);

				// Get all cells that are apart of the chain
				let chain = pairs.cFlat().filter(cell => cell.simpleState !== null);
				// Remove duplicates
				let uChain = [...new Set(chain)];

				let _r = new _Chain(uChain, uChain.map(cell => [cell, cell.simpleState]), [], 0, null, candidate, pairs.filter(cell => cell.simpleState !== null));

				// ========
				// RULE ONE
				// ========
				
				// Iterate all cells and check if they see candidates with both states
				this.forEachCell(cell => {
					// Check if the cell contains `candidate`
					if (!cell.candidates.includes(candidate)) return;
					// Check if the cell is part of the chain
					if (cell.simpleState != null) return;

					// Determine whether this cell sees a true/false cell
					let tState = cell.sees().some(cCell => cCell.simpleState === true);
					let fState = cell.sees().some(cCell => cCell.simpleState === false);

					if (tState && fState) _r.changes.push([cell, null, cell.candidates.remove(candidate)]);
				});

				// If this chain has instigated changes, return it
				if (_r.changes.length) {
					_r.rule = 1;
					return _r;
				};

				// ========
				// RULE TWO
				// ========

				// Separate chain cells by their state
				let tCells = uChain.filter(cell => cell.simpleState);
				let fCells = uChain.filter(cell => !cell.simpleState);

				// We'll use this to determine if a state is 'on' or not
				let onState = null;

				// Get array of all houses the true/false cells are in
				let tRows = tCells.map(cell => cell.row);
				let tCols = tCells.map(cell => cell.col);
				let tBoxs = tCells.map(cell => cell.box);

				let fRows = fCells.map(cell => cell.row);
				let fCols = fCells.map(cell => cell.col);
				let fBoxs = fCells.map(cell => cell.box);

				// Determine if a state exists more than once in a house
				if (tRows.length != [...new Set(tRows)].length) onState = false;
				if (tCols.length != [...new Set(tCols)].length) onState = false;
				if (tBoxs.length != [...new Set(tBoxs)].length) onState = false;

				if (fRows.length != [...new Set(fRows)].length) onState = true;
				if (fCols.length != [...new Set(fCols)].length) onState = true;
				if (fBoxs.length != [...new Set(fBoxs)].length) onState = true;

				// Check if a state is in a house more than once
				if (onState !== null) {
					// Iterate through the chain turning the cells on or off
					uChain.forEach(cell => {
						if (cell.simpleState == onState) _r.changes.push([cell, candidate, [candidate]]);
						else _r.changes.push([cell, null, cell.candidates.remove(candidate)]);
					});
				};
				
				// If this chain has instigated changes, return it
				
				if (_r.changes.length) {
					_r.rule = 2;
					_r.onState = onState;
					return _r;
				};

				// Otherwise remove our chain cells from `pairs`
				pairs = pairs.filter(p => p[0].simpleState === null && p[1].simpleState === null);
			};

			function setState(cell, state) {
				// When we set the state of a cell, all of it's conjugate pairs must have an opposite state
				
				cell.simpleState = state;
				pairs.forEach(pair => {
					if (pair[0].id == cell.id && pair[1].simpleState === null) setState(pair[1], !state);
					if (pair[1].id == cell.id && pair[0].simpleState === null) setState(pair[0], !state);
				});
			};
		};

		return null;
	};

	this.ywing = () => {
		// Find bi-value cells linked with the pattern XZ -> XY <- YZ
		// Where the hinge (XY) can see both arms (XZ, YZ)
		// But the arms cannot see eachother


		function _Ywing(cells, changes, candidate) {
			this.name = 'YWING';

			// [_Cell (Hinge), _Cell (Arm1), _Cell (Arm2)]
			this.cells = cells || [];


			// [[_Cell(), value, candidates], [_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// 0-9 (Z value)
			this.candidate = candidate || 0;
		};


		// Get all bi-value cells
		let bivalue = [];
		this.forEachCell(cell => {
			if (cell.candidates.length == 2) bivalue.push(cell);
		});

		// Iterate our bi-value cells treating each as the hinge, looking for arms
		for (const hinge of bivalue) {
			let x, y, z;

			// Get a list of all possible arms (XZ or YZ candidates)
			let arms = bivalue.filter(cell => {
				// Exclude the hinge from possible arms
				if (cell.id == hinge.id) return false;
				// Exclude cells with both XY candidates (same as hinge)
				if (cell.candidates.equals(hinge.candidates)) return false;
				// Hinge must be able to see the arm && arm has one similar candidate (X || Y)
				return hinge.sees(cell) && hinge.candidates.some(c => cell.candidates.includes(c));
			});

			// Iterate our `arms` cells treating each as arm1, looking for possible arm2
			for (const arm1 of arms) {
				// Now that we have `hinge` and `arm` defined, we can determine X, Y and Z values
				// This will be useful for finding possible `arm2`
				hinge.candidates.forEach(c => {
					// The candidate found in `hinge` and `arm` is X
					// The other candidate in `hinge` is Y
					if (arm1.candidates.includes(c)) x = c;
					else y = c;
				});
				// Determine which candidate of `arm1` is not assigned yet.
				// This candidate becomes Z
				if ([x, y].includes(arm1.candidates[0])) z = arm1.candidates[1];
				else z = arm1.candidates[0];

				// Now that we have XYZ defined, we can find all possible `arm2` cells
				// The arms cannot see eachother && `arm2` must have YZ candidates
				let arms2 = arms.filter(cell => !arm1.sees(cell) && cell.candidates.every(c => [y, z].includes(c)));

				// Iterate through possible arm2 cells looking for the first y-wing that instigates changes
				for (const arm2 of arms2) {
					let _r = new _Ywing([hinge, arm1, arm2], [], z);

					// Get all cells seen by both arm1 and arm2
					let intersection = this.intersection([arm1, arm2]);
					// Then iterate through them and check if they contain candidate Z
					intersection.forEach(cell => {
						// Exclude cells that don't contain Z (excludes `hinge`)
						if (!cell.candidates.includes(z)) return;
						// Remove Z from candidates
						_r.changes.push([cell, null, cell.candidates.remove(z)]);
					});

					// Check if the ywing instigated changes
					if (_r.changes.length) return _r;
				};
			};
		};

		return null;
	};

	this.zwing = () => {
		// Similar to the Y-Wing, but in the form of XY -> XYZ -> YZ || XZ
		// TODO: Potentially combine _Game.Solving.ywing and _Game.Solving.zwing


		function _Zwing(cells, changes, candidate) {
			this.name = 'ZWING';

			// [_Cell (Hinge), _Cell (Arm1), _Cell (Arm2)]
			this.cells = cells || [];


			// [[_Cell(), value, candidates], [_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// 0-9 (Z value)
			this.candidate = candidate || 0;
		};


		// Get all bi-value/tri-value cells
		let bivalue = [];
		let trivalue = [];
		this.forEachCell(cell => {
			if (cell.candidates.length == 2) bivalue.push(cell);
			if (cell.candidates.length == 3) trivalue.push(cell);
		});

		// Iterate tri-value cells (hinges) looking for viable arms
		for (const hinge of trivalue) {
			// Get all viable arms
			// Arms must contain only XYZ candidates and must see the hinge
			let arms = bivalue.filter(cell => cell.candidates.every(c => hinge.candidates.includes(c) && hinge.sees(cell)));

			// Iterate `arms` treating each one as `arm1` while looking for a viable arm2
			for (const arm1 of arms) {
				// Find viable arm2 cells
				// arm1 must not see cell && arm2 cannot be XY
				let arms2 = arms.filter(cell => !arm1.sees(cell) && !cell.candidates.equals(arm1.candidates));

				// Iterate arms2 checking if the Z-Wing instigates changes
				for (const arm2 of arms2) {
					// Get all intersecting cells (must intersect hinge and both arms)
					let intersection = this.intersection([hinge, arm1, arm2], true);
					// Get the value of Z
					let z = arm1.candidates.find(c => arm2.candidates.includes(c));

					let _r = new _Zwing([hinge, arm1, arm2], [], z);

					// Check each intersecting cell and remove any Z candidates
					intersection.forEach(cell => {
						// Exclude the hinge
						if (cell.id == hinge.id) return;
						// Exclude cells without Z
						if (!cell.candidates.includes(z)) return;

						// Remove Z from the cell
						_r.changes.push([cell, null, cell.candidates.remove(z)]);
					});

					// Check if our Z-Wing instigated changes
					if (_r.changes.length) return _r;
				};
			};
		};

		return null;
	};

	this.bug = () => {
		// When all but one cell is bi-value, the bug cell must be the candidate
		// that results in a solvable puzzle (a completely bi-value puzzle is unsolvable)
		
		// All BUGs can be found via XY-Chains


		function _Bug(cells, changes, candidate) {
			this.name = 'BUG';

			// [_Cell (bug)]
			this.cells = cells || [];

			// [[_Cell(), value, candidates]]
			this.changes = changes || [];

			// 0-9 
			this.candidate = candidate || 0;
		};


		// First, determine if all cells are bi-value with exactly one tri-value cell (the `bug`)
		let bug;
		for (const cell of this.cells) {
			// Exclude cells with values
			if (cell.value) continue;

			// If this is the first tri-value cell found, it's the bug
			// If it's not, BUG is not applicable here
			if (cell.candidates.length == 3) {
				if (bug) return null;
				else bug = cell;
			};

			// If there are any cells over 3 candidates, BUG is not applicable here
			if (cell.candidates.length > 3) return null;
		};

		// Check if we found our bug
		if (!bug) return null;

		// One of the candidates will appear thrice in the row/column/box of the bug
		let candidate = bug.candidates.find(c => 
			this.containsCandidates(c, bug.row).length == 3 
			&& this.containsCandidates(c, 0, bug.col).length == 3 
			&& this.containsCandidates(c, 0, 0, bug.box).length == 3
		);

		return new _Bug([bug], [[bug, candidate, [candidate]]], candidate);
	};

	this.xcycle = () => {
		// Find all strong links (conjugate pairs) between cells and try to form a loop using weak/strong links
		// TODO: Comment this
		// TODO: Optimise this, currently takes ~53 seconds on 000908430004702680081054002005003129000520308000090560000079810017005006400106050
		// 										Optimised from 53 -> 50 -> 38 -> 34
		// BUG: Finds weak xcycle instead of strong: 804537000023614085605982034000105870500708306080203450200859003050371208008426507
		// BUG: Simple states don't propogate consistently on rule 3 - this just affects ui highlighting


		// Nice Loop [RULE 1] - Continuous (strong -> weak -> strong -> weak -^)
		// Nice Loop [RULE 2] - Discontinuous Strong (strong -> weak -> strong -> strong -> weak -^) 
		// Nice Loop [RULE 3] - Discontinuous Weak (strong -> weak -> strong -> weak -> weak -^)

		
		function _Xcycle(cells, changes, candidate, strongs, weaks, rule, ruleCell) {
			this.name = 'XCYCLE';

			// [_Cell, ...]
			this.cells = cells || [];

			// [[_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// 0-9 
			this.candidate = candidate || 0;

			// [[_Cell, _Cell], ...]
			this.strongs = strongs || [];
			
			// [[_Cell, _Cell], ...]
			this.weaks = weaks || [];

			// 1/2/3
			this.rule = rule || 0;

			// _Cell
			this.ruleCell = ruleCell || null;
		};


		// Iterate through all candidates looking for viable X-Cycles
		for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
			// Find all conjugate pairs
			let pairs = [];
			for (const house of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
				// Get all cells that contain `candidate` in `house`
				let rCells = this.containsCandidates(candidate, house);
				let cCells = this.containsCandidates(candidate, 0, house);
				let bCells = this.containsCandidates(candidate, 0, 0, house);
				
				// If there are only two cells containing `candidate`, those cells are conjugate pairs
				if (rCells.length == 2) pairs.push(rCells);
				if (cCells.length == 2) pairs.push(cCells);
				if (bCells.length == 2) pairs.push(bCells);
			};
			
			// Incrementally increase the number of pairs `r` chosen from the set `pairs`
			for (let r = 1; r <= pairs.length; r++) {
				// Iterate each combination of `r` conjugate pairs
				for (const combo of Math.combinations(pairs.length, r)) {
					// Get the conjugate pairs (strongly linked cells) for our combo
					let strongs = combo.map(index => pairs[index]);
					// We'll attempt to fill the X-Cycle with weak links
					let weaks = [];
					// Get all the cells involved into one variable
					let xcycle = strongs.cFlat();

					// Reset the _Cell properties we'll be using
					this.forEachCell(cell => {
						cell.hasWeak = false;
						cell.simpleState = null;
					});

					// Set the _Cell.simpleState of all cells in our xcycle.
					// setState() is recursive and will affect all relevant cells
					setState(strongs[0][0], true);
					setState(strongs[0][1], false);
					
					strongs.forEach(pair => {
						let [strong1, strong2] = pair;

						if (!strong1.hasWeak) {
							let weak1 = xcycle.find(cell => strong1.weak(candidate, cell));

							if (weak1 && !weak1.hasWeak) {
								strong1.hasWeak = true;
								weak1.hasWeak = true;
								weaks.push([strong1, weak1]);
							};
						};

						if (!strong2.hasWeak) {
							let weak2 = xcycle.find(cell => strong2.weak(candidate, cell));

							if (weak2 && !weak2.hasWeak) {
								strong2.hasWeak = true;
								weak2.hasWeak = true;
								weaks.push([strong2, weak2]);
							};
						};
					});
					let continuous = strongs.every(pair => pair[0].hasWeak && pair[1].hasWeak);

					let _r = new _Xcycle(strongs.cFlat(), [], candidate, strongs, weaks);

					if (continuous) {
						// ===============================
						// NICE LOOP [RULE 1] - CONTINUOUS
						// ===============================
						this.forEachCell(cell => {
							// Check if the cell contains `candidate`
							if (!cell.candidates.includes(candidate)) return;
							// Check if the cell is part of the xcycle
							if (xcycle.cellIds().includes(cell.id)) return;
		
							// Determine whether this cell sees a true/false cell
							let tState = cell.sees().some(cCell => cCell.simpleState === true);
							let fState = cell.sees().some(cCell => cCell.simpleState === false);
		
							if (tState && fState) _r.changes.push([cell, null, cell.candidates.remove(candidate)]);
						});
						
						if (_r.changes.length) {
							_r.rule = 1;
							return _r;
						};
					};
					
					let failed = xcycle.filter(cell => !cell.hasWeak);

					if (failed.every(cell => cell.id == failed[0].id)) {
						// =========================================
						// NICE LOOP [RULE 2] - DISCONTINUOUS STRONG
						// =========================================
						_r.rule = 2;
						_r.ruleCell = failed[0];
						_r.changes.push([_r.ruleCell, candidate, [candidate]]);
						return _r;
					};
					if (failed.length == 2) {
						let intersects = this.intersection(failed, true);
						intersects.forEach(cell => {
							if (!cell.candidates.includes(candidate)) return;
							// =======================================
							// NICE LOOP [RULE 3] - DISCONTINUOUS WEAK
							// =======================================
							_r.changes.push([cell, null, cell.candidates.remove(candidate)]);
							_r.weaks.push([failed[0], cell], [failed[1], cell]);
						});

						if (_r.changes.length) {
							_r.rule = 3;
							return _r;
						};
					};



					function setState(cell, state) {
						cell.simpleState = state;
						
						xcycle.forEach(link => {
							if (link.simpleState !== null) return;

							if (cell.strong(candidate, link)) setState(link, !state);
							else if (state && cell.sees(link) && link.candidates.includes(candidate)) setState(link, false);
						});
					};
				};
			};
		};
		

		return null;
	};

	this.xychain = () => {
		// Try to find two bi-value cells containing a candidate and link them with more bi-value cells
		// TODO: Comment this


		function _Xychain(cells, changes, candidate, chain, start, end) {
			this.name = 'XYCHAIN';

			// [_Cell, ...]
			this.cells = cells || [];

			// [[_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// 0-9 
			this.candidate = candidate || 0;

			// [_Link, ...]
			this.chain = chain || [];

			// [_Cell()]
			this.start = start || null;
			
			// [_Cell()]
			this.end = end || null;
		};


		// Get all bi-value cells
		// We'll use these to look for viable "target" (start & end) cells
		let bivalues = [];
		this.forEachCell(cell => {
			if (cell.candidates.length == 2) bivalues.push(cell);
		});

		// Iterate through each candidate
		for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
			// Look for two or more bi-value cells containing `candidate` to test XY-Chains on
			let targets = bivalues.filter(cell => cell.candidates.includes(candidate));
			// If we can't find at least two bi-value cells, move on
			if (targets.length < 2) continue;

			// Iterate through each target cell, using it as a start
			// We don't need to look at the last target cell because no other target cells could chain to it
			for (const start of targets.slice(0, -1)) {
				// This constructor function will help us keep track of the XY-Chain's cell ordering
				function _Link(cell, backward, forward) {
					this.cell = cell;
					this.backward = backward || 0;
					this.forward = forward || 0;
				};

				// Put all non-`start` target cells in an array
				let ends = targets.filter(cell => cell.id != start.id && this.intersection([start, cell], true).filter(inter => inter.candidates.includes(candidate)).length);
				let startL = new _Link(start, candidate, start.candidates.find(c => c != candidate));
				let endsL = ends.map(end => new _Link(end, end.candidates.find(c => c != candidate), candidate));

				// Check if any `start` to `end` chain would instigate changes
				if (!ends.length) continue;

				let found = false;
				let chain = [];

				function recurse(curr) {
					// If we've found a viable XY-Chain, return
					if (found) return;
					// Otherwise push our current _Link to the chain
					chain.push(curr);

					// Check if the current _Link sees any end, and it has the correct candidate to end the cycle
					let endL = endsL.find(endL => curr.cell.sees(endL.cell) && curr.forward == endL.backward);
					if (endL) {
						found = true;
						chain.push(endL);
						return;
					};

					// Find the next possible cells of the chain
					let next = bivalues.filter(cell => {
						return (
							cell.candidates.includes(curr.forward)
							&& cell.sees(curr.cell)
							&& !ends.cellIds().includes(cell.id)
							&& chain.every(link => link.cell.id != cell.id)
						);
					});
					next.forEach(cell => recurse(new _Link(cell, curr.forward, cell.candidates.find(c => c != curr.forward))));
					if (found) return;
					else chain.pop();
				};
				recurse(startL);

				if (chain.length) {
					let end = chain[chain.length - 1].cell;
					let _r = new _Xychain(chain.map(link => link.cell), [], candidate, chain, start, end);
					let intersection = this.intersection([start, end], true);
					intersection.forEach(cell => {
						if (!cell.candidates.includes(candidate)) return;

						_r.changes.push([cell, null, cell.candidates.remove(candidate)]);
					});
					return _r;
				};
			};
		};

		return null;
	};

	this.medusa = () => {
		// Establish chains between bi-value, weak and stronly linked cells
		// TODO: Comment this

		// RULE 1: Two candidates in cell same colour
		// RULE 2: Two candidates in house same colour
		// RULE 3: Two colours in same cell
		// RULE 4: Candidate in cell seen by two colours
		// RULE 5: One colour in cell, other colour seen
		// RULE 6: All candidates in cell eliminated by one colour


		function _Medusa(cells, changes, strongs, weaks, inters, rule, contradiction) {
			this.name = '3DMEDUSA';

			// [_Cell, ...]
			this.cells = cells || [];

			// [[_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// [[_Cell(), _Cell(), candidate], ...]
			this.strongs = strongs || [];

			// [[_Cell(), _Cell(), candidate], ...]
			this.weaks = weaks || [];

			// [[_Cell(), cadidate1, candidate2], ...]
			this.inters = inters || [];

			// 1/2/3/4/5/6
			this.rule = rule || 0;

			// [_Cell(), ...]
			this.contradiction = contradiction || [];
		};


		let bivalues = [];
		this.forEachCell(cell => {
			if (cell.candidates.length == 2) bivalues.push(cell);
		});

		for (const start of bivalues) {
			this.forEachCell(cell => {
				cell.simpleState = null;
				for (let i = 1; i <= 9; i++) cell.complexState[i] = null;
			});

			let _r = new _Medusa();
			setState(start, start.candidates[0], true);
			_r.cells = this.cells.filter(cell => cell.simpleState);
		
			let onState = null;


			// ======
			// RULE 1
			// ======
			this.forEachCell(cell => {
				let tCan = Object.entries(cell.complexState).filter(entry => entry[1] === true);
				if (tCan.length > 1) {
					onState = false;
					_r.contradiction.push(cell);
				};

				let fCan = Object.entries(cell.complexState).filter(entry => entry[1] === false);
				if (fCan.length > 1) {
					onState = true;
					_r.contradiction.push(cell);
				};
			});
			if (onState !== null) {
				_r.cells.forEach(cell => {
					for (const [key, value] of Object.entries(cell.complexState)) {
						if (value === null) continue;
						let candidate = parseInt(key);
						if (value === onState) _r.changes.push([cell, candidate, [candidate]]);
						else _r.changes.push([cell, null, cell.candidates.remove(candidate)]);
					};
				});
			};
			if (_r.changes.length) {
				_r.rule = 1;
				return _r;
			};


			// ======
			// RULE 2
			// ======
			for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
				let tCells = _r.cells.filter(cell => cell.complexState[candidate] === true);
				let fCells = _r.cells.filter(cell => cell.complexState[candidate] === false);

				let tRows = tCells.map(cell => cell.row);
				let tCols = tCells.map(cell => cell.col);
				let tBoxs = tCells.map(cell => cell.box);

				let fRows = fCells.map(cell => cell.row);
				let fCols = fCells.map(cell => cell.col);
				let fBoxs = fCells.map(cell => cell.box);

				if (tRows.length != [...new Set(tRows)].length) {
					onState = false;
					_r.contradiction.push(...tCells.filter(cell => tRows.filter(n => n == cell.row).length > 1));
				};
				if (tCols.length != [...new Set(tCols)].length) {
					onState = false;
					_r.contradiction.push(...tCells.filter(cell => tCols.filter(n => n == cell.col).length > 1));
				};
				if (tBoxs.length != [...new Set(tBoxs)].length) {
					onState = false;
					_r.contradiction.push(...tCells.filter(cell => tBoxs.filter(n => n == cell.box).length > 1));
				};
	
				if (fRows.length != [...new Set(fRows)].length) {
					onState = true;
					_r.contradiction.push(...fCells.filter(cell => fRows.filter(n => n == cell.row).length > 1));
				};
				if (fCols.length != [...new Set(fCols)].length) {
					onState = true;
					_r.contradiction.push(...fCells.filter(cell => fCols.filter(n => n == cell.col).length > 1));
				};
				if (fBoxs.length != [...new Set(fBoxs)].length) {
					onState = true;
					_r.contradiction.push(...fCells.filter(cell => fBoxs.filter(n => n == cell.box).length > 1));
				};

				if (onState !== null) {
					_r.cells.forEach(cell => {
						for (const [key, value] of Object.entries(cell.complexState)) {
							if (value === null) continue;
							let candidate = parseInt(key);
							if (value === onState) _r.changes.push([cell, candidate, [candidate]]);
							else _r.changes.push([cell, null, cell.candidates.remove(candidate)]);
						};
					});
				};
				if (_r.changes.length) {
					_r.rule = 2;
					return _r;
				};
			};
			

			// ======
			// RULE 3
			// ======
			_r.cells.forEach(cell => {
				if (cell.candidates.length < 3) return;

				let tCan, fCan;
				for (const [key, value] of Object.entries(cell.complexState)) {
					if (value === true) tCan = parseInt(key);
					if (value === false) fCan = parseInt(key);
				};

				if (tCan && fCan) {
					_r.changes.push([cell, null, [tCan, fCan]]);
					_r.contradiction.push(cell);
				};
			});
			if (_r.changes.length) {
				_r.rule = 3;
				return _r;
			};


			// TODO: Combine rule 4 & 5
			// ======
			// RULE 4
			// ======
			for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
				this.forEachCell(cell => {
					// Check if the cell contains `candidate`
					if (!cell.candidates.includes(candidate)) return;
					// Check if the cell is part of the chain
					if (cell.simpleState !== null) return;
	
					// Determine whether this cell sees a true/false cell
					let tState = cell.sees().some(cCell => cCell.complexState[candidate] === true);
					let fState = cell.sees().some(cCell => cCell.complexState[candidate] === false);
	
					if (tState && fState) _r.changes.push([cell, null, cell.candidates.remove(candidate)]);
				});
			};
			if (_r.changes.length) {
				_r.rule = 4;
				return _r;
			};


			// ======
			// RULE 5
			// ======
			for (const candidate of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
				this.forEachCell(cell => {
					// Check if the cell contains `candidate`
					if (!cell.candidates.includes(candidate)) return;
					if (cell.complexState[candidate] !== null) return;
	
					// Determine whether this cell sees a true/false cell
					let tState = cell.sees().some(cCell => cCell.complexState[candidate] === true);
					let fState = cell.sees().some(cCell => cCell.complexState[candidate] === false);
					for (const [key, value] of Object.entries(cell.complexState)) {
						if (value === true) tState = true;
						if (value === false) fState = true; 
					};
	
					if (tState && fState) _r.changes.push([cell, null, cell.candidates.remove(candidate)]);
				});
			};
			if (_r.changes.length) {
				_r.rule = 5;
				return _r;
			};


			// =====
			// RULE 6
			// ======
			this.forEachCell(cell => {
				if (cell.simpleState !== null) return;

				if (cell.candidates.every(candidate => cell.sees().some(tCell => tCell.complexState[candidate] === true))) {
					_r.contradiction.push(cell);
					onState = false;
				};
				if (cell.candidates.every(candidate => cell.sees().some(tCell => tCell.complexState[candidate] === false))) {
					_r.contradiction.push(cell);
					onState = true;
				};
				
			});
			if (onState !== null) {
				_r.cells.forEach(cell => {
					for (const [key, value] of Object.entries(cell.complexState)) {
						if (value === null) continue;
						let candidate = parseInt(key);
						if (value === onState) _r.changes.push([cell, candidate, [candidate]]);
						else _r.changes.push([cell, null, cell.candidates.remove(candidate)]);
					};
				});
			};
			if (_r.changes.length) {
				_r.rule = 6;
				return _r;
			};



			function setState(cell, candidate, state) {
				if (cell.complexState[candidate] || !cell.candidates.includes(candidate)) return;

				cell.simpleState = true;
				cell.complexState[candidate] = state;

				if (cell.candidates.length == 2) {
					_r.inters.push([cell, candidate, cell.candidates.find(c => c != candidate)]);
					setState(cell, cell.candidates.find(c => c != candidate), !state);
				};
	
				cell.sees().forEach(link => {
					if (cell.strong(candidate, link)) {
						_r.strongs.push([cell, link, candidate]);
						setState(link, candidate, !state);
					};
				});
			};
		};

		return null;
	};

	this.unique = () => {
		// For a puzzle to have a unique soluton, there must be no rectangle patterns of XY <-> XY | XY <-> XY (over 2 boxes)
		// TODO: comment this


		function _Unique(cells, changes, candidates, type, roof, floor) {
			this.name = 'UNIQUERECTANGLE';

			// [_Cell, ...]
			this.cells = cells || [];


			// [[_Cell(), value, candidates], ...]
			this.changes = changes || [];

			// [candidate1, candidate2]
			this.candidates = candidates || [];

			// 1/2/3/4/5
			this.type = type || 0;

			// [_Cell(), ...]
			this.roof = roof || [];
			
			// [_Cell(), ...]
			this.floor = floor || [];
		};


		let bivalues = [];
		this.forEachCell(cell => {
			if (cell.candidates.length == 2) bivalues.push(cell);
		});

		let bicandidates = bivalues.map(cell => cell.candidates).filter(function(candidates) {
			let key = candidates.join('-');
			return this[key] ? true : !(this[key] = true);
		}, Object.create(null));
		let uBicandidates = [...new Set(bicandidates.map(bivalue => JSON.stringify(bivalue)))].map(bivalue => JSON.parse(bivalue));

		for (const candidates of uBicandidates) {
			let corners = this.containsCandidates(candidates, 0, 0, 0, false, true);
			
			for (const combo of Math.combinations(corners.length, 4)) {
				let cells = combo.map(index => corners[index]);

				let floor = cells.filter(cell => cell.candidates.length == 2);
				if (floor.length < 2) continue;

				let roof = cells.filter(cell => cell.candidates.length != 2);
				if (!roof.length) continue;

				let rows = cells.map(cell => cell.row);
				let cols = cells.map(cell => cell.col);
				let boxs = cells.map(cell => cell.box);
				if (new Set(rows).size != 2) continue;
				if (new Set(cols).size != 2) continue;
				if (new Set(boxs).size != 2) continue;

				let _r = new _Unique(cells, [], candidates, 0, roof, floor);

				if (roof.length == 1) {
					// ================================
					// TYPE ONE: XY <-> XY | XYZ <-> XY
					// ================================

					let cell = roof[0];
					_r.type = 1;
					_r.changes.push([cell, null, cell.candidates.remove(_r.candidates)]);
					return _r;
				};

				if (roof.every(cell => cell.candidates.length == 3)) {

					if (roof[0].candidates.equals(roof[1].candidates)) {
						// =================================
						// TYPE TWO: XY <-> XY | XYZ <-> XYZ
						// =================================

						let candidate = roof[0].candidates.find(c => !candidates.includes(c));
						let intersecting = this.intersection(roof, true).filter(cell => cell.candidates.includes(candidate));
						intersecting.forEach(cell => _r.changes.push([cell, null, cell.candidates.remove(candidate)]));
						if (_r.changes.length) {
							_r.type = 2;
							return _r;
						};
					};
				};

				// ===================================
				// TYPE THREE: XY <-> XY | XYA <-> XYB
				// ===================================

				let [roof1, roof2] = roof;

				let rCandidates = roof.map(cell => cell.candidates.find(c => !candidates.includes(c)));
				rCandidates = [...new Set(rCandidates.sort((a, b) => a - b))];

				let tuples = [];
				if (roof1.row == roof2.row) tuples.push(this.containsCandidates(rCandidates, roof1.row));
				if (roof1.col == roof2.col) tuples.push(this.containsCandidates(rCandidates, 0, roof1.col));
				if (roof1.box == roof2.box) tuples.push(this.containsCandidates(rCandidates, 0, 0, roof1.box));

				console.log(tuples);

				tuples.forEach(tuple => {
					if (tuple.length != rCandidates.length) return;

					let intersecting = this.intersection([...roof, ...tuple], true);
					intersecting.forEach(cell => {
						if (!cell.candidates.some(c => rCandidates.includes(c))) return;
						_r.changes.push([cell, null, cell.candidates.remove(rCandidates)]);
					});
				});

				if (_r.changes.length) {
					_r.type = 3;
					return _r;
				};
			};
		};
	};


	// ==============
	// Game Functions
	// ==============

	this.step = (fn, args = []) => {
		if (this.solution) {
			console.warn('_Game.solution already populated - run _Game.commit()');
			return;
		};

		// If fn is defined, use that function specifically to solve
		if (fn) {
			this.solution = fn(...args);
			return;
		};

		let t0, t1;

		// =================
		// SIMPLE STRATEGIES
		// =================

		// Hidden/Naked Singles (finds all at once)
		t0 = performance.now();
		this.solution = this.singles();
		t1 = performance.now();
		console.log(`_Game.Solving.singles(): ${t1 - t0} ms`);
		if (this.solution) return;

		// Hidden/Naked Pairs
		t0 = performance.now();
		this.solution = this.tuple(2);
		t1 = performance.now();
		console.log(`_Game.Solving.tuple(2): ${t1 - t0} ms`);
		if (this.solution) return;

		// Hidden/Naked Triples
		t0 = performance.now();
		this.solution = this.tuple(3);
		t1 = performance.now();
		console.log(`_Game.Solving.tuple(3): ${t1 - t0} ms`);
		if (this.solution) return;

		// Hidden/Naked Quads
		t0 = performance.now();
		this.solution = this.tuple(4);
		t1 = performance.now();
		console.log(`_Game.Solving.tuple(4): ${t1 - t0} ms`);
		if (this.solution) return;

		// Pointing Pairs/Triples
		t0 = performance.now();
		this.solution = this.pointing();
		t1 = performance.now();
		console.log(`_Game.Solving.pointing(): ${t1 - t0} ms`);
		if (this.solution) return;

		// Line Reductions
		t0 = performance.now();
		this.solution = this.lineReduction();
		t1 = performance.now();
		console.log(`_Game.Solving.lineReduction(): ${t1 - t0} ms`);
		if (this.solution) return;


		// ================
		// TOUGH STRATEGIES
		// ================
		
		// X-Wings
		t0 = performance.now();
		this.solution = this.fish(2);
		t1 = performance.now();
		console.log(`_Game.Solving.fish(2): ${t1 - t0} ms`);
		if (this.solution) return;

		// Chains (Simple Colouring)
		t0 = performance.now();
		this.solution = this.chain();
		t1 = performance.now();
		console.log(`_Game.Solving.chain(): ${t1 - t0} ms`);
		if (this.solution) return;

		// Y-Wing
		t0 = performance.now();
		this.solution = this.ywing();
		t1 = performance.now();
		console.log(`_Game.Solving.ywing(): ${t1 - t0} ms`);
		if (this.solution) return;

		// Swordfish
		t0 = performance.now();
		this.solution = this.fish(3);
		t1 = performance.now();
		console.log(`_Game.Solving.fish(3): ${t1 - t0} ms`);
		if (this.solution) return;

		// Z-Wing
		t0 = performance.now();
		this.solution = this.zwing();
		t1 = performance.now();
		console.log(`_Game.Solving.zwing(): ${t1 - t0} ms`);
		if (this.solution) return;


		// =====================
		// DIABOLICAL STRATEGIES
		// =====================

		// X-Cycles
		t0 = performance.now();
		this.solution = this.xcycle();
		t1 = performance.now();
		console.log(`_Game.Solving.xcycle(): ${t1 - t0} ms`);
		if (this.solution) return;

		// XY-Chains
		t0 = performance.now();
		this.solution = this.xychain();
		t1 = performance.now();
		console.log(`_Game.Solving.xychain(): ${t1 - t0} ms`);
		if (this.solution) return;

		// 3D Medusa
		t0 = performance.now();
		this.solution = this.medusa();
		t1 = performance.now();
		console.log(`_Game.Solving.medusa(): ${t1 - t0} ms`);
		if (this.solution) return;

		// Jellyfish
		t0 = performance.now();
		this.solution = this.fish(4);
		t1 = performance.now();
		console.log(`_Game.Solving.fish(4): ${t1 - t0} ms`);
		if (this.solution) return;

		// Unique Rectangles
		t0 = performance.now();
		this.solution = this.unique();
		t1 = performance.now();
		console.log(`_Game.Solving.unique(): ${t1 - t0} ms`);
		if (this.solution) return;

		//Fireworks

		// SK Loops

		// WXYZ Wings

		// Aligned Pair Exclusion


		// ===============
		// EVIL STRATEGIES
		// ===============


		//================
		// TRIAL AND ERROR
		// ===============


		// ========
		// ESOTERIC
		// ========

		// Squirmbag
		t0 = performance.now();
		this.solution = this.fish(5);
		t1 = performance.now();
		console.log(`_Game.Solving.fish(5): ${t1 - t0} ms`);
		if (this.solution) return;

		// Bi-Value Universal Graveyard (BUG)
		t0 = performance.now();
		this.solution = this.bug();
		t1 = performance.now();
		console.log(`_Game.Solving.bug(): ${t1 - t0} ms`);
		if (this.solution) return;

		// Gurth's Theorem


	};

	this.commit = () => {
		if (!this.solution) {
			console.warn('_Game.solution is null, run _Game.step()');
			return;
		};

		this.solution.changes.forEach(change => {
			let cell = change[0];
			let value = change[1];
			let candidates = change[2].sort((a, b) => a - b);

			if (value) cell.setValue(value);
			else cell.candidates = candidates;
		});

		this.solution = null;
		this.generateCandidates();
	};
};




(function definePrototypes() {
	// Self-invoked to define some prototypes we will need

	// Array.prototype.equals
	if (Array.prototype.equals) console.warn('Overriding existing Array.prototype.equals method');
	Array.prototype.equals = function(array) {
		if (!array) return false;
		if (this.length != array.length) return false;

		for (var i = 0, l=this.length; i < l; i++) {
			if (this[i] instanceof Array && array[i] instanceof Array) {
				if (!this[i].equals(array[i]))
					return false;       
			}           
			else if (this[i] != array[i]) { 
				return false;   
			}           
		}       
		return true;
	}
	Object.defineProperty(Array.prototype, "equals", {enumerable: false});


	// Array.prototype.remove
	if (Array.prototype.remove) console.warn('Overriding existing Array.prototype.remove method');
	Array.prototype.remove = function(e) {
		if (!Array.isArray(e)) e = [e];

		return this.filter(v => !e.includes(v));
	};
	Object.defineProperty(Array.prototype, 'remove', {enumerable: false});

	
	// Array.prototype.cellIds
	if (Array.prototype.cellIds) console.warn('Overriding existing Array.prototype.cellIds method');
	Array.prototype.cellIds = function() {
		return this.map(cell => cell.id);
	};
	Object.defineProperty(Array.prototype, "cellIds", {enumerable: false});


	// Array.prototype.cFlat
	// Native Array.flat() is very slow
	if (Array.prototype.cFlat) console.warn('Overriding existing Array.prototype.cFlat method');
	Array.prototype.cFlat = function() {
		return [].concat(...this);
	};
	Object.defineProperty(Array.prototype, 'cFlat', {enumerable: false});


	// Math.combinations
	if (Math.combinations) console.warn('Overriding existing Math.combinations method');
	Math.combinations = (n, r, index = 0) => {
		const result = [];
		const combos = [];
		const recurse = start => {
			if (combos.length + (n - start + index) < r) return;
			recurse(start + 1);
			combos.push(start);
			if (combos.length === r) {     
				result.push(combos.slice());
			} else if(combos.length + (n - start + 1 + index) >= r) {
				recurse(start + 1);
			};
			combos.pop();
		};
		recurse(index, combos);
		return result;
	};
	Object.defineProperty(Math, 'combinations', {enumerable: false});

	// Math.permutations
	if (Math.permutations) console.warn('Overriding existing Math.permutations method');
	Math.permutations = (n, r, index = 0) => {
		let result = [];
		let digits = Array(r).fill(index);

		while (digits.at(-1) < n) {
			digits[0]++;
			digits.forEach((v, i) => {
				if (v >= n) {
					digits[i+1]++;
					digits[i] = index;
				};
			});

			if ([...new Set(digits)].length != digits.length) continue;
			else result.push([...digits]);
		};

		return result;
	};
	Object.defineProperty(Math, 'permutations', {enumerable: false});
})();