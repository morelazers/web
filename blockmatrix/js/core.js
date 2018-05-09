(function ()
{
	'use strict';
	var Core = tm.Class(
	{
		BPM: 120,
		ROWS: 16,
		COLUMNS: 16,
		NOTESIZE: 50,
		currentScale: 'Pentatonic',
		SCALES: {
			Pentatonic: ['E6', 'D6', 'C6', 'A5', 'G5', 'E5', 'D5', 'C5', 'A4', 'G4', 'E4', 'D4', 'C4', 'A3', 'G3', 'E3', 'D3'],
			Minor: ['F5','E5','D5', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3', 'G3', 'F3', 'E3']
		},
		grid: [],
    elem: [],
		noteIndex: 0,
		constructor: function (opts)
		{
			this.setScale(localStorage.getItem('scale') || this.currentScale);
			this.Synth = new tm.Synth(
			{
				bpm: this.BPM,
				rows: this.ROWS
			});

			this.generateGrid();

			this.startLoop();
			this.events();
		},

		startLoop: function ()
		{
			clearInterval(this.loop);
			this.loop = setInterval(this.audioLoop.bind(this), 60 / this.BPM / 2 * 1000);
		},

		stopLoop: function ()
		{
			clearInterval(this.loop);
			this.loop = null;
		},

		setScale: function (scale)
		{
			this.currentScale = scale;
			localStorage.setItem('scale', scale);
		},

		setBpm: function (bpm)
		{
			this.BPM = bpm;
			localStorage.setItem('bpm', bpm);
			this.startLoop();
		},

		toggleNote: function (row, column, status = 1)
		{
			var note = this.grid[row][column];
			var action = note ? 'remove' : 'add';
			this.grid[row][column] = status;
      if (status) {
        this.elem[row][column].classList.add('active')
      } else {
        this.elem[row][column].classList.remove('active')
      }
		},

    gameLoop: function()
    {
        var g = [];
        for(var i=0;i<this.grid.length;i++){
            g[i]=[];
            for(var j=0;j<this.COLUMNS;j++) {
                var c = 0;
                 if(j+1<this.COLUMNS){
                     if(this.grid[i][j+1]==1) c++;
                     if(i>0 && this.grid[i-1][j+1]==1) c++;
                     if(i+1<this.grid.length && this.grid[i+1][j+1]==1) c++;
                 }
                if(i>0 && this.grid[i-1][j]==1) c++;
                if(i+1<this.grid.length &&  this.grid[i+1][j]==1) c++;
                if(j >0 ){
                     if(this.grid[i][j-1]==1) c++;
                     if(i>0 && this.grid[i-1][j-1]==1) c++;
                     if(i+1<this.grid.length && this.grid[i+1][j-1]==1) c++;
                 }
                var r = this.grid[i][j];
                if(this.grid[i][j]==1 && c<2) r=0;
                if(this.grid[i][j]==1 && c>3) r=0;
                if(this.grid[i][j]==0 && c==3) r=1;
                g[i].push(r);
            }
        }
        for(var i=0;i<this.grid.length;i++){
            for(var j=0;j<this.COLUMNS;j++) {
                if(g[i][j]!=this.grid[i][j])
                    this.toggleNote( {target: this.elem[i][j]} );
            }
        }    
    },

		audioLoop: function ()
		{
			var currentTime = this.Synth.context.currentTime - this.startTime;
			for (var i = 0; i < this.grid.length; i++)
			{
				if (this.grid[i][this.noteIndex])
				{
					this.hitNote(tm.$(i + '' + this.noteIndex), i, this.noteIndex);
					this.Synth.playNote(this.SCALES[this.currentScale][i]);
				}
			}

			this.noteIndex++;
			if (this.noteIndex === this.COLUMNS)
			{
				this.noteIndex = 0;
			}
		},

		hitNote: function (note, row, column)
		{
			note.classList.add('hit');
      addCoord(row, column)
			setTimeout(function () {
				note.classList.remove('hit');
        removeCoord(row, column)
			}, 500);
		},

		generateGrid: function ()
		{
			var i = 0;
			var j;
			var note;
			var tmpGrid = tm.decode(window.location.hash.slice(1) || localStorage.getItem('notes')) || [];

			for (; i < this.ROWS; i++)
			{
				this.grid[i] = [];
        this.elem[i]=[];
				for (j = 0; j < this.COLUMNS; j++)
				{
					this.grid[i].push(0);

					note = document.createElement('div');
					note.id = i + '' + j;
					note.style.cssText = 'width: ' + (this.NOTESIZE - 1) + 'px; height: ' + (this.NOTESIZE - 1) + 'px; top: ' + this.NOTESIZE * i + 'px; left: ' + this.NOTESIZE * j + 'px';
					note.setAttribute('data-row', i);
					note.setAttribute('data-column', j);
					note.classList.add('note');
          this.elem[i].push(note);

					tm.$('tonematrix').appendChild(note);

					if (tmpGrid[i] && tmpGrid[i][j])
					{
						this.grid[i][j] = 1;
						note.classList.add('active');
					}
				}
			}
		},

    parseBlock: function (block) {
      var splitChars = block.hash.substring(2, block.hash.length).split('')
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
          this.toggleNote(i, j, false)
        }
      }
      this.chooseFromHex(splitChars)
    },

    getLatestBlock: function () {
      window.web3.eth.getBlock('latest', (error, block) => {
        this.parseBlock(block)
      })
    },

    getBlockPeriodic: function () {
      setInterval(() => {
        this.getLatestBlock()
      }, 1000)
    },

		events: function ()
		{
      if (window.web3) {
        var filter = window.web3.eth.filter('latest', (error, result) => {
          window.web3.eth.getBlock(result, true, (e, block) => {
            this.parseBlock(block)
          });
        });
      } else {
        window.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/T1YIsUqqHW568dijGClq'))
        this.getBlockPeriodic()
      }
      this.getLatestBlock()
			tm.$('tonematrix').on('mousedown', this, false);
			tm.$('tonematrix').on('mousemove', this, false);
			window.addEventListener('mouseup', this, false);
		},

    chooseFromHex: function (hexChars) {
      let index = 0
      let chosenNumbers = []
      let noteCount = 0
      for (let char of hexChars) {
        let largerThanLast = 0
        let smallerThanNext = 0
        let lastFourDecimal = 0
        let thisFourDecimal = 0
        let nextFourDecimal = 0
        if (index < 4) {
          largerThanLast = 1
        } else {
          lastFourDecimal = this.getFourByteDecimal(hexChars[index-4], hexChars[index-3], hexChars[index-2], hexChars[index-1])
        }
        if (index > hexChars.length - 5) {
          smallerThanNext = 1
        } else {
          nextFourDecimal = this.getFourByteDecimal(hexChars[index+4], hexChars[index+3], hexChars[index+2], hexChars[index+1])
        }
        if (index > 2 && index < hexChars.length - 3) {
          thisFourDecimal = this.getFourByteDecimal(hexChars[index-1], hexChars[index], hexChars[index+1], hexChars[index+2])
        } else {
          smallerThanNext = 0
        }

        if (thisFourDecimal > lastFourDecimal) largerThanLast = 1
        if (thisFourDecimal < nextFourDecimal) smallerThanNext = 1

        let startingPosition = index++ * 4
        let decimalValue = web3.toDecimal("0x" + char)
        let chosenNumber = Math.round(decimalValue / 4) + startingPosition
        // chosenNumbers.push(chosenNumber)
        let column = chosenNumber % 16
        let row = Math.floor(chosenNumber / 16)
        if (++noteCount % 3 == 0) this.toggleNote(column, row)
      }
    },

    getFourByteDecimal: function (a, b, c, d) {
      let concat = "0x" + a + b + c + d
      return web3.toDecimal(concat)
    }
	});

	tm.Core = Core;

})();
