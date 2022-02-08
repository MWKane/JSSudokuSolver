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
	// `this.value` should be read-only as candidates need to be in sync.
	// See helper function `setValue`
	Object.defineProperty(this, 'value', {
		'value': value,
		writable: false
	});
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
		for (const candidate of this.candidates) {
			if (!this.validate(candidate)) this.removeCandidate(candidate);
		};

		return this.candidates;
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

	// =================
	// Solving Functions
	// =================

	this.sees = (cell) => {
		if (cell) return (cell.row == this.row || cell.col == this.col || cell.box == this.box);

		let cells = [];
		this.game.forEachCell(tCell => {
			if (this.row == tCell.row || this.col == tCell.col || this.box == tCell.box) cells.push(tCell);
		});

		return cells;
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

	this.changes = [];

	// =================
	// Iterative Functions
	// =================

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

	// ================
	// Solver Functions
	// ================

};