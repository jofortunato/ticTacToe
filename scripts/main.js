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
    let _isTie = false;

    const createPlayers = () => {
        _player1 = playerFactory("Player 1", "X", false);
        _player2 = playerFactory("Player 2", "O", false);
        _currentPlayer = _player1;
    }

    const setCurrentPlayer = (player) => {_currentPlayer = player};

    const getCurrentPlayer = () => _currentPlayer;

    const getWinner = () => _winner;

    const isTie = () => _isTie;

    const playTurn = (move) => {
        if (_winner === null) {
            gameBoard.addPlay(_currentPlayer, move);
            _turn += 1;
            
            if (checkWin()) {
                _winner=_currentPlayer;
                _currentPlayer.addWin();
            }
            else if (_turn > 9) {
                _isTie = true;
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
        _turn = 1;
        _currentPlayer = _player1;
        _winner = null;
        _isTie = false;
        gameBoard.resetBoard();
    }

    return {isTie, getWinner, getCurrentPlayer, createPlayers, setCurrentPlayer, playTurn, checkWin, restartGame}
})();

const playerFactory = (name, marker, isAi) => {
    let _numberWins = 0;
    const addWin = () => {_numberWins += 1};
    const getNumberWins = () =>{return _numberWins};

    return {name, marker, isAi, getNumberWins, addWin}
};

const uiController = (() => {
    let replayBtn = document.getElementById("replay");
    let playground = document.getElementById("playground");
    let infoPanel = document.getElementById("info-panel");
    let playHumanBtn = document.getElementById("vs-human");
    let playRandomBtn
    let playAiBtn
    let menu = document.getElementById("menu");
    let gameContainer = document.getElementById("game");
    let backBtn = document.getElementById("back");
    
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
                    showPlayerTurn(game.getCurrentPlayer().name);

                    if (game.getWinner() !== null) {
                        showPlayerWin(game.getWinner().name);
                        playground.classList.add("game-over");
                    }
                    else if (game.isTie() === true) {
                        showTie();
                        playground.classList.add("game-over");
                    }
                }
            }
        });
    }

    const addEventListenerToRestart = () => {
        replayBtn.addEventListener("click", () => {
            game.restartGame();
            loadGameBoard();
            showPlayerTurn(game.getCurrentPlayer().name);
            playground.classList.remove("game-over");
        });
    }

    const showPlayerTurn = (playerName) => {
        infoPanel.textContent = `${playerName} turn.`
    }

    const showPlayerWin = (playerName) => {
        infoPanel.textContent = `Winner is ${playerName}!`
    }

    const showTie = () => {
        infoPanel.textContent = `It's a Tie!`
    }

    const addEventListenerToPlayHuman = () => {
        playHumanBtn.addEventListener("click", () => {
            menu.classList.add("display-none");
            gameContainer.classList.remove("display-none");

            game.createPlayers();
            setupPlayground();            
        });
    }

    const addEventListenerToBack = () => {
        backBtn.addEventListener("click", () => {
            gameContainer.classList.add("display-none");
            menu.classList.remove("display-none");
            playground.classList.remove("game-over");

            game.restartGame();
        });
    }

    const setupPlayground = () => {
        loadGameBoard();
        showPlayerTurn(game.getCurrentPlayer().name);
        addEventListenerToPlayground();
        addEventListenerToRestart();
        addEventListenerToBack();
    }

    
    addEventListenerToPlayHuman();

    return {loadGameBoard}
})();