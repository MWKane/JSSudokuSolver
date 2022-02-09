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
	
	this.simpleState = null;

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
		if (cell) return (cell.row == this.row || cell.col == this.col || cell.box == this.box);

		let cells = [];
		this.game.forEachCell(tCell => {
			if (this.row == tCell.row || this.col == tCell.col || this.box == tCell.box) cells.push(tCell);
		});

		return cells;
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

		this.forEachCell(cell => {
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
		});

		return cells;
	};

	// =================
	// Solving Functions
	// =================

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
		for (const tuple of Math.combinations(9, n)) {
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

			// [_Cell, _Cell, ...] (n cells)
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
						conflicts.forEach(cell => _r.changes.push([cell, null, cell.candidates.filter(c => c != candidate)]));
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
						conflicts.forEach(cell => _r.changes.push([cell, null, cell.candidates.filter(c => c != candidate)]));
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

			// [_Cell, _Cell, ...] (n cells)
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
						conflicts.forEach(cell => _r.changes.push([cell, null, cell.candidates.filter(c => c != candidate)]));
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
						conflicts.forEach(cell => _r.changes.push([cell, null, cell.candidates.filter(c => c != candidate)]));
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

		// Fish have 5 main types:
		// n = 1: Hidden Single (Basic - also covered in _Game.Solving.tuples)
		// n = 2: X-Wing (Tough)
		// n = 3: Swordfish (Tough)
		// n = 4: Jellyfish (Diabolical)
		// n = 5: Squirmbag (Esoteric)


		function _Fish(cells, changes, type, candidate) {
			this.name = 'FISH';
			this.class = [,'HIDDEN SINGLE', 'X-WING', 'SWORDFISH', 'JELLYFISH', 'SQUIRMBAG'][n];

			// [_Cell, _Cell, ...] (n cells)
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
					let fish = combo.map(index => rTuples[index - 1]).flat();

					// Get the unique columns of our fish
					let cols = [...new Set(fish.map(cell => cell.col))];

					// Test if it has n unique columns
					if (cols.length == n) {
						// ==========
						// FISH (ROW)
						// ==========

						let _r = new _Fish(fish, [], 'ROW', candidate);

						// Iterate each column of our fish and remove `candidate` from non-fish cells
						this.forEachCellOfCols(cols, cell => {
							// Check if cell contains `candidate`
							if (!cell.candidates.includes(candidate)) return;
							// Check if cell is part of our fish
							if (fish.cellIds().includes(cell.id)) return;

							// Remove our candidate from the cell
							_r.changes.push([cell, null, cell.candidates.filter(c => c != candidate)]);
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
					let fish = combo.map(index => cTuples[index - 1]).flat();

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
							_r.changes.push([cell, null, cell.candidates.filter(c => c != candidate)]);
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

		function _Chain(cells, cellStates, changes, rule, onState, candidate) {
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
				let chain = pairs.flat().filter(cell => cell.simpleState != null);
				// Remove duplicates
				let uChain = [...new Set(chain)];

				let _r = new _Chain(uChain, uChain.map(cell => [cell, cell.simpleState]), [], 0, null, candidate);

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

					if (tState && fState) _r.changes.push([cell, null, cell.candidates.filter(c => c != candidate)]);
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
						else _r.changes.push([cell, null, cell.candidates.filter(c => c != candidate)]);
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



	// ==============
	// Game Functions
	// ==============

	this.step = () => {
		if (this.solution) {
			console.warn('_Game.solution already populated - run _Game.commit()');
			return;
		};


		// =================
		// SIMPLE STRATEGIES
		// =================

		// Hidden/Naked Singles
		this.solution = this.tuple(1);
		if (this.solution) return;

		// Hidden/Naked Pairs
		this.solution = this.tuple(2);
		if (this.solution) return;

		// Hidden/Naked Triples
		this.solution = this.tuple(3);
		if (this.solution) return;

		// Hidden/Naked Quads
		this.solution = this.tuple(4);
		if (this.solution) return;

		// Pointing Pairs/Triples
		this.solution = this.pointing();
		if (this.solution) return;

		// Line Reductions
		this.solution = this.lineReduction();
		if (this.solution) return;


		// ================
		// TOUGH STRATEGIES
		// ================
		
		// X-Wings
		this.solution = this.fish(2);
		if (this.solution) return;

		// Chains (Simple Colouring)
		this.solution = this.chain();
		if (this.solution) return;

		// Y-Wing

		// Swordfish
		this.solution = this.fish(3);
		if (this.solution) return;

		// Z-Wing

		// Binomial Universal Graveyard (BUG)


		// =====================
		// DIABOLICAL STRATEGIES
		// =====================

		// X-Cycles

		// XY-Chains

		// 3D Medusa

		// Jellyfish
		this.solution = this.fish(4);
		if (this.solution) return;

		// Unique Rectangles

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

		// Gurth's Theorem
		
		// Squirmbag
		this.solution = this.fish(5);
		if (this.solution) return;
	};

	this.commit = () => {
		if (!this.solution) {
			console.warn('_Game.solution is null, run _Game.step()');
			return;
		};

		this.solution.changes.forEach(change => {
			let cell = change[0];
			let value = change[1];
			let candidates = change[2];

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

	
	// Array.prototype.cellIds
	if (Array.prototype.cellIds) console.warn('Overriding existing Array.prototype.cellIds method');
	Array.prototype.cellIds = function() {
		return this.map(cell => cell.id);
	};
	Object.defineProperty(Array.prototype, "cellIds", {enumerable: false});


	// Math.combinations
	if (Math.combinations) console.warn('Overriding existing Math.combinations method');
	Math.combinations = (n, k) => {
		const result = [];
		const combos = [];
		const recurse = start => {
			if (combos.length + (n - start + 1) < k) return;
			recurse(start + 1);
			combos.push(start);
			if (combos.length === k) {     
				result.push(combos.slice());
			} else if(combos.length + (n - start + 2) >= k) {
				recurse(start + 1);
			};
			combos.pop();     
		};
		recurse(1, combos);
		return result;
	};
	Object.defineProperty(Math, 'combinations', {enumerable: false});
})();