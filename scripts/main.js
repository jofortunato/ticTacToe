const gameBoard = (() => {
    let _board = [[null, "O", null],
                ["O", null, "X"],
                [null, "X", null]];

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
    let _turn = 0;
    let _currentPlayer = null;
    let winner = null;

    const setCurrentPlayer = (player) => {_currentPlayer = player};

    const playTurn = (move) => {
        gameBoard.addPlay(_currentPlayer, move);
        _turn += 1;
        
        if (checkWin()) {
            winner=_currentPlayer;
            _currentPlayer.addWin();
            /*uiController.showWinner;*/
            console.log(`Winner is ${_currentPlayer.name}.`);
        }

        gameBoard.showBoard();
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
        _currentPlayer = null;
        winner = null;
        gameBoard.resetBoard();
        uiController.loadGameBoard();
    }

    return {winner, setCurrentPlayer, playTurn, checkWin, restartGame}
})();

const player = (name, marker, isAi) => {
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
                if (board[i][j] !== null) {
                    cellIdentifier = `pf-${i}${j}`

                    if (board[i][j] === "O") {
                        let cell = document.getElementById(cellIdentifier);
                        cell.classList.add("circle");
                    }
                    else if (board[i][j] === "X") {
                        let cell = document.getElementById(cellIdentifier);
                        cell.classList.add("cross");
                    }
                }

            }
        }
    }

    const addEventListenerToPlayground = () => {
        let playground = document.getElementById("playground");

        playground.addEventListener("click", e => {
            if (e.target.classList.contains("play-field")) {
                if (e.target.classList.contains("cross") || e.target.classList.contains("circle")) {
                    console.log("Occupied!");
                }
                else {
                    console.log("Is empty!");
                }
            }
        })
    }

    loadGameBoard();
    addEventListenerToPlayground();

    return {loadGameBoard}
})();