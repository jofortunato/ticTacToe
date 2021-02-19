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

    const createPlayers = (AItype) => {
        _player1 = playerFactory("Player 1", "X", false);
        _player2 = playerFactory("Player 2", "O", AItype);
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
            
            let result = checkWin();
            console.log(result)
            if (result.isGameOver && result.winner !== null) {
                _winner=_currentPlayer;
                _currentPlayer.addWin();
            }
            else if (result.isGameOver && result.winner === null) {
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

    const randomMove = () => {
        let board = gameBoard.getBoard();
        let emptyCells = [];

        for (let i=0; i<3; ++i) {
            for (let j=0; j<3; ++j) {
                if (board[i][j] === null) {
                    emptyCells.push({row: i, column: j})
                }
            }
        }

        let move = emptyCells[Math.floor(Math.random() * (emptyCells.length ))];
        

        return move
    }

    const checkWin = () =>{
        if (_turn >= 5 ) {
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

            if (isWinningSequence) {
                return {isGameOver: true , winner: _currentPlayer}
            }
            else if (_turn > 9){
                return {isGameOver: true , winner: null}
            }
            else {
                return {isGameOver: false, winner: null}
            }
        }
        else {
            return {isGameOver: false, winner: null}
        }
    }

    const restartGame = () => {
        _turn = 1;
        _currentPlayer = _player1;
        _winner = null;
        _isTie = false;
        gameBoard.resetBoard();
    }

    return {isTie, getWinner, getCurrentPlayer, createPlayers, setCurrentPlayer, playTurn, checkWin, restartGame, randomMove}
})();

const playerFactory = (name, marker, AItype) => {
    let _numberWins = 0;
    const addWin = () => {_numberWins += 1};
    const getNumberWins = () =>{return _numberWins};

    return {name, marker, AItype, getNumberWins, addWin}
};

const uiController = (() => {
    let replayBtn = document.getElementById("replay");
    let playground = document.getElementById("playground");
    let infoPanel = document.getElementById("info-panel");
    let playHumanBtn = document.getElementById("vs-human");
    let playRandomBtn = document.getElementById("vs-random");
    let playAiBtn = document.getElementById("vs-ai");
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

                    let markClass
                    markClass = getMarkerClass();
                    e.target.classList.add(markClass);

                    let cellIdentifier = e.target.id;
                    let row = cellIdentifier.slice(-2,-1);
                    let column = cellIdentifier.slice(-1);
                    let move = {row: parseInt(row), column: parseInt(column)};

                    game.playTurn(move);
                    showPlayerTurn(game.getCurrentPlayer().name);

                    checkEndGame();
                    
                    if (game.getCurrentPlayer().AItype !== false) {
                        if (game.getCurrentPlayer().AItype === "random") {
                            move = game.randomMove();
                        }
                        else {
                            /*Call AI move generator*/
                        }

                        markerClass = getMarkerClass();
                        let randomPlayCell = document.getElementById(`pf-${move.row}${move.column}`)
                        randomPlayCell.classList.add(markClass);

                        game.playTurn(move);
                        showPlayerTurn(game.getCurrentPlayer().name);
                        checkEndGame();

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

            game.createPlayers(false);
            setupPlayground();            
        });
    }

    const addEventListenerToPlayRandomBtn = () => {
        playRandomBtn.addEventListener("click", () => {
            menu.classList.add("display-none");
            gameContainer.classList.remove("display-none");

            game.createPlayers("random");
            setupPlayground();            
        });
    }

    const addEventListenerToPlayAiBtn = () => {
        playAiBtn.addEventListener("click", () => {
            alert("Feature Under Development.")
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

    const checkEndGame = () => {
        if (game.getWinner() !== null) {
            showPlayerWin(game.getWinner().name);
            playground.classList.add("game-over");
        }
        else if (game.isTie() === true) {
            showTie();
            playground.classList.add("game-over");
        }
    }

    const getMarkerClass = () => {
        if (game.getCurrentPlayer().marker === "X") {
            return "cross"
        }
        else {
            return "circle"
        }
    }

    
    addEventListenerToPlayHuman();
    addEventListenerToPlayRandomBtn();
    addEventListenerToPlayAiBtn();

    return {loadGameBoard}
})();