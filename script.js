document.addEventListener("DOMContentLoaded", () => {
    const boardElement = document.getElementById('board');
    const quitButton = document.getElementById('quit');
    const turnElement = document.getElementById('turn');
    const messageElement = document.getElementById('message');

    const pieceIcons = {
        '1-pawn': 'assets/1-pawn.png',
        '1-rook': 'assets/1-rook.png',
        '1-knight': 'assets/1-knight.png',
        '1-bishop': 'assets/1-bishop.png',
        '1-queen': 'assets/1-queen.png',
        '1-king': 'assets/1-king.png',
        '2-pawn': 'assets/2-pawn.png',
        '2-rook': 'assets/2-rook.png',
        '2-knight': 'assets/2-knight.png',
        '2-bishop': 'assets/2-bishop.png',
        '2-queen': 'assets/2-queen.png',
        '2-king': 'assets/2-king.png'
    };

    let board = [];
    let currentPlayer = 1;
    let selectedPiece = null;


    function createBoard() {
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                boardElement.appendChild(square);
                board[row][col] = null;
            }
        }
        initializePieces();
    }

    function initializePieces() {
        const pieceLayout = [
            ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"],
            Array(8).fill("pawn"),
            ...Array(4).fill(Array(8).fill(null)),
            Array(8).fill("pawn"),
            ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
        ];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (pieceLayout[row][col]) {
                    createPiece(row < 2 ? 1 : 2, row, col, pieceLayout[row][col]);
                }
            }
        }
    }

    function createPiece(player, row, col, type) {
        const piece = document.createElement('div');
        piece.className = 'piece';
        piece.dataset.player = player;
        piece.dataset.type = type;
        piece.dataset.row = row;
        piece.dataset.col = col;
    
        const img = document.createElement('img');
        img.src = pieceIcons[`${player}-${type}`];
        piece.appendChild(img);
    
        document.querySelector(`[data-row='${row}'][data-col='${col}']`).appendChild(piece);
        board[row][col] = { player, type };
    }
    

    boardElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('square')) {
            handleSquareClick(e.target);
        } else if (e.target.parentElement.classList.contains('piece')) {
            handlePieceClick(e.target.parentElement);
        }
    });


    function handleSquareClick(square) {
        if (selectedPiece) {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            if (isValidMove(selectedPiece, row, col)) {
                makeMove(selectedPiece, row, col);
                const winner = checkWin();
                if (winner) {
                    messageElement.textContent = `Player ${winner} wins!`;
                    return;
                }
                switchPlayer();
                messageElement.textContent = '';
            } else {
                messageElement.textContent = 'Invalid move. Try again.';
            }
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
        }
    }
    
    function handlePieceClick(piece) {
        if (piece.dataset.player == currentPlayer) {
            if (selectedPiece) {
                selectedPiece.classList.remove('selected');
            }
            selectedPiece = piece;
            piece.classList.add('selected');
        } else {
            if (selectedPiece) {
                const row = parseInt(piece.parentElement.dataset.row);
                const col = parseInt(piece.parentElement.dataset.col);
                if (isValidMove(selectedPiece, row, col)) {
                    makeMove(selectedPiece, row, col);
                    const winner = checkWin();
                    if (winner) {
                        messageElement.textContent = `Player ${winner} wins!`;
                        return;
                    }
                    switchPlayer();
                } else {
                    messageElement.textContent = 'Invalid move. Try again.';
                }
                selectedPiece.classList.remove('selected');
                selectedPiece = null;
            }
        }
    }
    
    
    /* PROMOTION FNC */

    function promotePawn(row, col) {
        const modal = document.getElementById('promotion-modal');
        const closeModal = document.getElementById('close-modal');
        const promotionChoices = document.getElementById('promotion-choices');
        
        // Display the modal
        modal.style.display = 'block';
        
        // Close the modal when the user clicks on <span> (x)
        closeModal.onclick = function() {
            modal.style.display = 'none';
            // If modal is closed without selection, promote to queen by default
            selectPiece('queen');
        }
        
        // Close the modal when the user clicks anywhere outside of the modal
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                // If modal is closed without selection, promote to queen by default
                selectPiece('queen');
            }
        }
        
        // Handle piece selection
        promotionChoices.onclick = function(event) {
            if (event.target.classList.contains('promotion-icon')) {
                const selectedPiece = event.target.dataset.piece;
                modal.style.display = 'none';
                selectPiece(selectedPiece);
            }
        }
        
        function selectPiece(selectedPiece) {
            // Remove the pawn from the board
            const square = boardElement.querySelector(`[data-row='${row}'][data-col='${col}']`);
            square.removeChild(square.firstChild);
        
            // Create the new piece
            if(currentPlayer === 1  )
                createPiece(2, row, col, selectedPiece);
            // currentPlayer = 2;
            else 
                createPiece(1, row, col, selectedPiece);
            // currentPlayer = 1;
        
            // Update the board state
            board[row][col].type = selectedPiece;
        }
    }
    
      /* PROMOTION FNC */

    function isValidMove(piece, row, col) {
        const currentRow = parseInt(piece.parentElement.dataset.row);
    const currentCol = parseInt(piece.parentElement.dataset.col);
    const pieceType = piece.dataset.type;

    if (forcedCapture()) {
        // If there's a forced capture, player must make a capture move
        if (!canPieceCapture(currentRow, currentCol, pieceType) || (board[row][col] === null || board[row][col].player === currentPlayer)) {
            console.log(`Forced capture available. Player ${currentPlayer} must capture.`);
            messageElement.textContent = 'You must capture a piece if possible.';
            return false;
        }
    }

    // Ensure the target square is within the board boundaries
    if (row < 0 || row > 7 || col < 0 || col > 7) {
        console.log(`Invalid move: Target square (${row}, ${col}) is out of bounds`);
        return false;
    }

    // Check if the target square is occupied by own piece
    if (board[row][col] !== null && board[row][col].player === currentPlayer) {
        console.log(`Invalid move: Target square (${row}, ${col}) is occupied by own piece`);
        return false;
    }



        console.log(pieceType);
        switch (pieceType) {
            case 'pawn':
                return isValidPawnMove(currentRow, currentCol, row, col);
            case 'rook':
                return isValidRookMove(currentRow, currentCol, row, col);
            case 'knight':
                return isValidKnightMove(currentRow, currentCol, row, col);
            case 'bishop':
                return isValidBishopMove(currentRow, currentCol, row, col);
            case 'queen':
                return isValidQueenMove(currentRow, currentCol, row, col);
            case 'king':
                return isValidKingMove(currentRow, currentCol, row, col);
            default:
                return false;
        }
    }

    /*FORCED CAPTURE START*/

    function forcedCapture() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.player === currentPlayer) {
                    if (canPieceCapture(row, col, piece.type)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    function canPieceCapture(row, col, type) {
        const potentialMoves = getPotentialMoves(row, col, type);
        for (const move of potentialMoves) {
            const [targetRow, targetCol] = move;
            if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                if (board[targetRow][targetCol] && board[targetRow][targetCol].player !== currentPlayer) {
                    return true;
                }
            }
        }
        return false;
    }
    
    function getPotentialMoves(row, col, type) {
        switch (type) {
            case 'pawn':
                return [
                    [row + (currentPlayer === 1 ? 1 : -1), col + 1],
                    [row + (currentPlayer === 1 ? 1 : -1), col - 1]
                ];
            case 'rook':
                return getLineMoves(row, col, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
            case 'knight':
                return [
                    [row + 2, col + 1], [row + 2, col - 1], [row - 2, col + 1], [row - 2, col - 1],
                    [row + 1, col + 2], [row + 1, col - 2], [row - 1, col + 2], [row - 1, col - 2]
                ];
            case 'bishop':
                return getLineMoves(row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
            case 'queen':
                return getLineMoves(row, col, [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
            case 'king':
                return [
                    [row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1],
                    [row + 1, col + 1], [row + 1, col - 1], [row - 1, col + 1], [row - 1, col - 1]
                ];
            default:
                return [];
        }
    }
    
    function getLineMoves(row, col, directions) {
        const moves = [];
        for (const [dRow, dCol] of directions) {
            let r = row + dRow;
            let c = col + dCol;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                moves.push([r, c]);
                if (board[r][c] !== null) break; // Stop at the first piece encountered
                r += dRow;
                c += dCol;
            }
        }
        return moves;
    }
    
    

     /*FORCED CAPTURE END*/
        

     function isValidPawnMove(currentRow, currentCol, row, col, capturing = false) {
        const direction = currentPlayer === 1 ? 1 : -1;
        const initialRow = currentPlayer === 1 ? 1 : 6;
    
        // Check if moving forward one square
        if (col === currentCol && row === currentRow + direction && !capturing) {
            return board[row][col] === null; // Can only move forward if square is empty
        }
    
        // Check if moving forward two squares from the initial position
        if (col === currentCol && row === currentRow + 2 * direction && currentRow === initialRow && !capturing) {
            return board[row][col] === null && board[currentRow + direction][currentCol] === null; // Can move two squares only if both squares are empty
        }
    
        // Check if capturing diagonally
        if (Math.abs(currentCol - col) === 1 && row === currentRow + direction) {
            if (capturing) {
                return board[row][col] !== null && board[row][col].player !== currentPlayer; // Valid capture
            } else {
                return board[row][col] !== null && board[row][col].player !== currentPlayer; // Valid capture
            }
        }
    
        return false; // Invalid move if none of the conditions are met
    }
    
    

    function isValidRookMove(currentRow, currentCol, row, col, capturing = false) {
        if (currentRow !== row && currentCol !== col) {
            return false;
        }
        const stepRow = currentRow === row ? 0 : (row - currentRow) / Math.abs(row - currentRow);
        const stepCol = currentCol === col ? 0 : (col - currentCol) / Math.abs(col - currentCol);
        let i = currentRow + stepRow;
        let j = currentCol + stepCol;
        while (i !== row || j !== col) {
            if (board[i][j] !== null) {
                return false;
            }
            i += stepRow;
            j += stepCol;
        }
        return capturing ? board[row][col] !== null : true;
    }

    function isValidKnightMove(currentRow, currentCol, row, col, capturing = false) {
        const rowDiff = Math.abs(currentRow - row);
        const colDiff = Math.abs(currentCol - col);
        if (rowDiff === 2 && colDiff === 1 || rowDiff === 1 && colDiff === 2) {
            return capturing ? board[row][col] !== null : true;
        }
        return false;
    }

    function isValidBishopMove(currentRow, currentCol, row, col, capturing = false) {
        if (Math.abs(currentRow - row) !== Math.abs(currentCol - col)) {
            return false;
        }
        const stepRow = (row - currentRow) / Math.abs(row - currentRow);
        const stepCol = (col - currentCol) / Math.abs(col - currentCol);
        let i = currentRow + stepRow;
        let j = currentCol + stepCol;
        while (i !== row || j !== col) {
            if (board[i][j] !== null) {
                return false;
            }
            i += stepRow;
            j += stepCol;
        }
        return capturing ? board[row][col] !== null : true;
    }

    function isValidQueenMove(currentRow, currentCol, row, col, capturing = false) {
        return isValidRookMove(currentRow, currentCol, row, col, capturing) || isValidBishopMove(currentRow, currentCol, row, col, capturing);
    }

    function isValidKingMove(currentRow, currentCol, row, col, capturing = false) {
        return Math.abs(currentRow - row) <= 1 && Math.abs(currentCol - col) <= 1 && (capturing ? board[row][col] !== null : true);
    }


    function logMove(piece, fromRow, fromCol, toRow, toCol) {
        // Convert column numbers to letters (A-H)
        const colToLetter = col => String.fromCharCode('H'.charCodeAt(0) - col);
        // Convert row indices to chess row numbers (8-1)
        const rowToNumber = row =>  row+1;
    
        const fromColLetter = colToLetter(fromCol);
        const fromRowNumber = rowToNumber(fromRow);
        const toColLetter = colToLetter(toCol);
        const toRowNumber = rowToNumber(toRow);
    
        const move = `${piece.dataset.type} from ${fromColLetter}${fromRowNumber} to ${toColLetter}${toRowNumber}`;
        const moveHistory = currentPlayer === 1 ? document.getElementById('move-history-1') : document.getElementById('move-history-2');
        const moveItem = document.createElement('li');
        moveItem.textContent = move;
        moveHistory.appendChild(moveItem);
    }
    
    
    
    
    
    function makeMove(piece, row, col) {
        const currentRow = parseInt(piece.parentElement.dataset.row);
        const currentCol = parseInt(piece.parentElement.dataset.col);
        
        // Log the move before making it
        logMove(piece, currentRow, currentCol, row, col);
    
        // Check if the target square is already occupied
        if (board[row][col] !== null) {
            // Remove the existing piece from the board
            boardElement.querySelector(`[data-row='${row}'][data-col='${col}']`).removeChild(boardElement.querySelector(`[data-row='${row}'][data-col='${col}']`).firstChild);
        }
    
        // Update the board with the moved piece
        boardElement.querySelector(`[data-row='${currentRow}'][data-col='${currentCol}']`).removeChild(piece);
        boardElement.querySelector(`[data-row='${row}'][data-col='${col}']`).appendChild(piece);
    
        // Update the piece's dataset attributes
        piece.dataset.row = row;
        piece.dataset.col = col;
    
        // Update the board representation
        board[row][col] = board[currentRow][currentCol];
        board[currentRow][currentCol] = null;

        if (piece.dataset.type === 'pawn' && (row === 0 || row === 7)) {
            promotePawn(row, col);
        }

    }
    
    
    function checkWin() {
        let player1Pieces = 0;
        let player2Pieces = 0;
    
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] !== null) {
                    if (board[row][col].player === 1) {
                        player1Pieces++;
                    } else if (board[row][col].player === 2) {
                        player2Pieces++;
                    }
                }
            }
        }
    
        if (player1Pieces === 0) {
            showWinModal("Player 2 wins!!")
            return 2; // Player 2 wins
        } else if (player2Pieces === 0) {
            showWinModal("Player 1 wins!!")
            return 1; // Player 1 wins
        }
    
        return 0; // No winner yet
    }
    


    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2  : 1;
        turnElement.textContent = `Player ${currentPlayer}'s turn`;
    }

    quitButton.addEventListener('click', () => {
        const winner = currentPlayer === 1 ? 2 : 1;
        showWinModal(`Player ${winner} wins!`);
    });
    

function resetGame() {
    boardElement.innerHTML = '';
    board = [];
    createBoard();
    currentPlayer = 1;
    turnElement.textContent = `Player 1's turn`;
    messageElement.textContent = '';
    
    // Clear move histories
    moveHistoryPlayer1 = [];
    moveHistoryPlayer2 = [];

    // Update move history display
    updateMoveHistory();
}
function showWinModal(message) {
    const winModal = document.getElementById('win-modal');
    const winMessage = document.getElementById('win-message');
    const winCloseModal = document.getElementById('win-close-modal');
    
    // Set the win message
    winMessage.textContent = message;
    
    // Display the modal
    winModal.style.display = 'block';
    
    // Close the modal when the user clicks on <span> (x)
    winCloseModal.onclick = function() {
        winModal.style.display = 'none';
        location.reload();
    }
    
    // Close the modal when the user clicks anywhere outside of the modal
    window.onclick = function(event) {
        if (event.target === winModal) {
            winModal.style.display = 'none';
            location.reload();
        }
    }
}

    resetGame();
});



