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
        _player1 = playerFactory("Player 1", "X", "human");
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
            
            let result = checkWin(gameBoard.getBoard(), _turn, _currentPlayer);

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

    const minimax = (board, depth, currentPlayer) => {
        let best = null
        
        if (currentPlayer.AItype === "ai") {
            best = {move: null, score: -Infinity};
        }
        else {
            best = {move: null, score: +Infinity};
        }
        
        let nextPlayer;
        if (currentPlayer === _player1) {
            nextPlayer = _player2;
        }
        else {
            nextPlayer = _player1;
        }

        let result = checkWin(board, depth+2, nextPlayer);
        if (result.isGameOver === true) {
            if (result.winner === null) {
                return {move: null, score: 0}
            }
            else if (result.winner.AItype === "ai") {
                return {move: null, score: 1}
            }
            else {
                return {move: null, score: -1}
            }
        }

        let intermediaryResult = null;

        for(let i=0; i<3; ++i) {
            for(let j=0; j<3; ++j) {
                if (board[i][j] === null) {
                    board[i][j] = currentPlayer.marker;

                    /*if (depth === 0) {
                        console.table(board)
                        console.table(best)
                    }*/
                    
                    intermediaryResult = minimax(board, depth+1, nextPlayer);

                    board[i][j] = null;

                    if (depth === 1) {
                        console.log("here")
                    }

                    if (currentPlayer.AItype === "ai") {
                        if (intermediaryResult.score > best.score) {
                            best = {move: {row: i, column: j}, score: intermediaryResult.score};
                        }
                    }
                    else {
                        if (intermediaryResult.score < best.score) {
                            best = {move: {row: i, column: j}, score: intermediaryResult.score};
                        }
                    }
                }
            }
        }
        
        return best
    }

    const checkWin = (board, turn, currentPlayer) =>{
        if (turn >= 5 ) {
            /*let board = gameBoard.getBoard();*/
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
                return {isGameOver: true , winner: currentPlayer}
            }
            else if (turn > 9){
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

    return {isTie, getWinner, getCurrentPlayer, createPlayers, setCurrentPlayer, playTurn, checkWin, restartGame, randomMove, minimax}
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

                    let markerClass
                    markerClass = getMarkerClass();
                    e.target.classList.add(markerClass);

                    let cellIdentifier = e.target.id;
                    let row = cellIdentifier.slice(-2,-1);
                    let column = cellIdentifier.slice(-1);
                    let move = {row: parseInt(row), column: parseInt(column)};

                    game.playTurn(move);
                    showPlayerTurn(game.getCurrentPlayer().name);

                    checkEndGame();

                    if (game.getCurrentPlayer().AItype !== "human") {
                        if (game.getCurrentPlayer().AItype === "random") {
                            move = game.randomMove();
                        }
                        else {
                            move = game.minimax(gameBoard.getBoard(),0,game.getCurrentPlayer()).move;
                        }

                        markerClass = getMarkerClass();
                        console.log(move)
                        let randomPlayCell = document.getElementById(`pf-${move.row}${move.column}`)
                        randomPlayCell.classList.add(markerClass);

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

            game.createPlayers("human");
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
            alert("Feature under development.");
            /*menu.classList.add("display-none");
            gameContainer.classList.remove("display-none");

            game.createPlayers("ai");
            setupPlayground();*/      
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