import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
    return (
        <button className={"square " + props.winnerClass} onClick={props.onClick}>
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
                value={this.props.squares[i][0]}
                onClick={ () => this.props.onClick(i)}
                winnerClass={winnerClass}
                key={i}
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
                // squares: Array(9).fill(null),
                squares: Array(9).fill(Array(3).fill(null)),
            }],
            xIsNext: true,
            stepNumber: 0,
            row: null,
            column: null,
            stepAll: [{
                steps: Array(1).fill(null),
            }]
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const stepAll = this.state.stepAll.slice(0, this.state.stepNumber + 1);
        const steps = stepAll[stepAll.length - 1].steps.slice();

        if (calculateWinner(squares).winner || squares[i][0]) {
            //console.log(calculateWinner(squares[i][0]));
            return;
        }

        const squareValue = this.state.xIsNext ? 'X' : 'O';
        const row = Math.ceil((i + 1) / 3);
        const column = ((i + 1) % 3) === 0 ? 3 : (i + 1) % 3;
        const addClass = "square-history";

        squares[i] = [squareValue, row, column, addClass];
        steps[history.length] = [row, column];


        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
            row: row,
            column: column,
            stepAll: [{
                steps: steps,
            }],

        });
    }

    jumpTo(step) {
        this.setState({
           stepNumber: step,
           xIsNext: (step % 2) === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const { winner, winnerRow } = calculateWinner(current.squares);

        const moves = history.map((step, move) => {

            const desc = move ?
                'Перейти к ходу №' + move + ' (строка ' + this.state.stepAll[0].steps[move][0] + ', столбец ' + this.state.stepAll[0].steps[move][1] + ')':
                'К началу игры';
            return (
                <li key={move}>
                    <button onClick={ () => this.jumpTo(move) }>{desc}</button>
                </li>
            );
        });


        let status;
        if (winner) {
            status = 'Выиграл ' + winner;
        } else if (this.state.stepAll[0].steps.length === 10) {
            status = 'Игра закончилась вничью';
        } else {
            status = 'Следующий ход: ' + (this.state.xIsNext ? 'X' : 'O');
        }


        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winnerSquares={winnerRow}
                    />
                </div>
                <div className="game-info">
                    <div>{ status } <span role="img" aria-label="rabbit"> &#128007; </span></div>
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
        if (squares[a][0] && squares[a][0] === squares[b][0] && squares[a][0] === squares[c][0]) {
            return { winner: squares[a][0], winnerRow: lines[i] };
        }
    }

    return { winner: null, winnerRow: null };
}
