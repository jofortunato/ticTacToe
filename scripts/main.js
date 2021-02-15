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
    let winner = null;
    let player1 = null;
    let player2 = null;

    const createPlayers = () => {
        player1 = playerFactory("Player 1", "X", false);
        player2 = playerFactory("Player 2", "O", false);
        _currentPlayer = player1;
    }

    const setCurrentPlayer = (player) => {_currentPlayer = player};

    const getCurrentPlayer = () => {return _currentPlayer};

    const playTurn = (move) => {
        gameBoard.addPlay(_currentPlayer, move);
        _turn += 1;
        
        if (checkWin()) {
            winner=_currentPlayer;
            _currentPlayer.addWin();
            /*uiController.showWinner;*/
            alert(`Winner is ${_currentPlayer.name}.`);
        }
        else if (_turn > 9) {
            alert("It's a Tie!")
        }
        else {
            if (_currentPlayer === player1) {
                _currentPlayer = player2;
            }
            else {
                _currentPlayer = player1;
            }
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

    return {player1, player2, winner, getCurrentPlayer, createPlayers, setCurrentPlayer, playTurn, checkWin, restartGame}
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
        })
    }

    game.createPlayers();
    loadGameBoard();
    addEventListenerToPlayground();

    return {loadGameBoard}
})();