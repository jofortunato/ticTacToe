const gameBoard = (() => {
    let _board = [[null, null, null],
                [null, null, null],
                [null, null, null]];

    const getBoard = () => {return _board};

    const showBoard = () => {console.table(_board)};

    const addPlay = (player, move) => {
        _board[move.row][move.column] = player.marker;
    }

    const resetBoard = () => {
        _board = [[null, null, null],
                [null, null, null],
                [null, null, null]]; 
    };
    
    return {showBoard, getBoard, addPlay, resetBoard}
})();

const game = (() => {
    let _turn = 1;
    let _currentPlayer = null;
    let _winner = null;
    let _player1 = null;
    let _player2 = null;

    const createPlayers = () => {
        _player1 = playerFactory("Player 1", "X", false);
        _player2 = playerFactory("Player 2", "O", false);
        _currentPlayer = _player1;
    }

    const setCurrentPlayer = (player) => {_currentPlayer = player};

    const getCurrentPlayer = () => _currentPlayer;

    const getWinner = () => _winner;

    const playTurn = (move) => {
        if (_winner === null) {
            gameBoard.addPlay(_currentPlayer, move);
            _turn += 1;
            
            if (checkWin()) {
                _winner=_currentPlayer;
                _currentPlayer.addWin();
                /*uiController.showWinner;*/
                alert(`Winner is ${_currentPlayer.name}.`);
            }
            else if (_turn > 9) {
                alert("It's a Tie!")
            }
            else {
                if (_currentPlayer === _player1) {
                    _currentPlayer = _player2;
                }
                else {
                    _currentPlayer = _player1;
                }
            }
        }
    };

    const checkWin = () =>{
        if (_turn >= 5) {
            let board = gameBoard.getBoard();
            let isWinningSequence = false;
            let auxDiagonalArray1 = [];
            let auxDiagonalArray2 = [];

            const hasEqualValues = arr => {
                return arr.every(v => v === arr[0] && arr[0] !== null)
            }

            for (let i=0; i<3; ++i) {
                isWinningSequence = hasEqualValues(board[i]) || isWinningSequence;

                let auxColumnArray = [];
                for (let j=0; j<3; ++j){
                    auxColumnArray.push(board[j][i]);
                }

                isWinningSequence = hasEqualValues(auxColumnArray) ||
                                    isWinningSequence;

                auxDiagonalArray1.push(board[i][i]);
                auxDiagonalArray2.push(board[i][2-i]);
            }
            isWinningSequence = hasEqualValues(auxDiagonalArray1) ||
                                hasEqualValues(auxDiagonalArray2) || 
                                isWinningSequence;

            return isWinningSequence;
        }
        else {
            return false;
        }
    }

    const restartGame = () => {
        _turn = 0;
        _currentPlayer = _player1;
        _winner = null;
        gameBoard.resetBoard();
    }

    return {getWinner, getCurrentPlayer, createPlayers, setCurrentPlayer, playTurn, checkWin, restartGame}
})();

const playerFactory = (name, marker, isAi) => {
    let _numberWins = 0;
    const addWin = () => {_numberWins += 1};
    const getNumberWins = () =>{return _numberWins};

    return {name, marker, isAi, getNumberWins, addWin}
};

const uiController = (() => {
    
    const loadGameBoard = () => {
        let board = gameBoard.getBoard();
        let cellIdentifier = ""

        for (let i=0; i<3; ++i) {
            for (let j=0; j<3; ++j) {
                cellIdentifier = `pf-${i}${j}`;
                let cell = document.getElementById(cellIdentifier);

                if (board[i][j] === "O") {
                    cell.classList.add("circle");
                }
                else if (board[i][j] === "X") {
                    cell.classList.add("cross");
                }
                else {
                    cell.classList.remove("cross");
                    cell.classList.remove("circle");
                }
            }

        }

    }

    const addEventListenerToPlayground = () => {
        let playground = document.getElementById("playground");

        playground.addEventListener("click", e => {
            if (e.target.classList.contains("play-field") && game.getWinner() === null) {
                if (!(e.target.classList.contains("cross") || e.target.classList.contains("circle"))) {

                    let currentPlayer = game.getCurrentPlayer();

                    let markClass
                    if (currentPlayer.marker === "X") {
                        markClass = "cross"
                    }
                    else {
                        markClass = "circle"
                    }

                    e.target.classList.add(markClass);

                    let cellIdentifier = e.target.id;
                    let row = cellIdentifier.slice(-2,-1);
                    let column = cellIdentifier.slice(-1);
                    let position = {row: parseInt(row), column: parseInt(column)};

                    game.playTurn(position);
                }
            }
        });
    }

    const addEventListenerToRestart = () => {
        let replayBtn = document.getElementById("replay");

        replayBtn.addEventListener("click", () => {
            game.restartGame();
            loadGameBoard();
        });
    }

    game.createPlayers();
    loadGameBoard();
    addEventListenerToPlayground();
    addEventListenerToRestart();

    return {loadGameBoard}
})();