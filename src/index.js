import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
    return (
        <button className={"square " + props.winnerClass} onClick={props.onClick} disabled={props.disabledButton}>
            {props.value}
        </button>
    )
}


class Board extends React.Component {
    createBoard(row, col) {
        const board = [];
        let number = 0;

        for (let i = 0; i < row; i++) {
            let items = [];
            for (let j = 0; j < col; j++) {
                items.push(this.renderSquare(number));
                number++;
            }
            board.push( <div key={i} className="board-row">{items}</div>);
        }

        return board;
    }


    renderSquare(i) {
        const winnerClass =
            this.props.winnerSquares &&
            (this.props.winnerSquares[0] === i ||
                this.props.winnerSquares[1] === i ||
                this.props.winnerSquares[2] === i)
                ? "square-winner"
                : "";

        return (
            <Square
                value={this.props.squares[i]}
                onClick={ () => this.props.onClick(i)}
                winnerClass={winnerClass}
                key={i}
                disabledButton={this.props.disabledButton}
            />
            );
    }

    render() {
        return (
            <div>
                {this.createBoard(3,3)}
            </div>
        );
    }
}


class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                 squares: Array(9).fill(null),
            }],
            xIsNext: true,
            currentStepNumber: 0,
            isGameFinished: false,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.currentStepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const winner = calculateWinner(squares).winner;

        // if (winner || history.length === 10) {
        //     this.updateGameStatusFinished();
        // }

        if (winner || squares[i]) {
            return;
        }

        const squareValue = this.state.xIsNext ? 'X' : 'O';
        const row = Math.ceil((i + 1) / 3);
        const column = ((i + 1) % 3) === 0 ? 3 : (i + 1) % 3;
        const stepNumber = history.length;
        squares[i] = squareValue;

        this.setState({
            history: history.concat([{
                squares: squares,
                stepNumber: stepNumber,
                row: row,
                column: column,
            }]),
            xIsNext: !this.state.xIsNext,
            currentStepNumber: history.length,
        });
    }

    jumpTo(step) {
        this.setState({
            currentStepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    sortSteps() {
        this.setState({
            history: this.state.history.reverse(),
        });
    }

    newGame() {
        this.setState({
            history: [{
                squares: Array(9).fill(null),
            }],
            xIsNext: true,
            currentStepNumber: 0,
            isGameFinished: false,
        });
    }

    updateGameStatusFinished() {
        if (!this.state.isGameFinished) {
            this.setState({isGameFinished: true});
        }
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.currentStepNumber];
        const { winner, winnerRow } = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const classButton = move === this.state.currentStepNumber ? "button-history" : "";
            const desc = step.stepNumber ?
                'Перейти к ходу №' + step.stepNumber + ' (строка ' + step.row + ', столбец ' + step.column + ')':
                'К началу игры';

            return (
                <li key={move}>
                    <button className={classButton} onClick={ () => this.jumpTo(move) }>{desc}</button>
                </li>
            );
        });


        let status;
        let disabledButton = false;
        if (winner) {
            status = 'Выиграл ' + winner;
            disabledButton = true;
        } else if (history.length === 10) {
            status = 'Игра закончилась вничью';
            disabledButton = true;
        } else {
            status = 'Следующий ход: ' + (this.state.xIsNext ? 'X' : 'O');
        }


        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i, winner)}
                        winnerSquares={winnerRow}
                        disabledButton={disabledButton}
//                        disabledButton={this.state.isGameFinished}
                    />
                </div>
                <div className="game-info">
                    <div>{ status } <span role="img" aria-label="rabbit"> &#128007; </span></div>
                    <button onClick={() => this.sortSteps()}>Сортировать ходы</button><br></br>
                    <button onClick={() => this.newGame()}>Новая игра</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], winnerRow: lines[i] };
        }
    }

    return { winner: null, winnerRow: null };
}
