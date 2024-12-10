import React from 'react';

function Rules() {
  return (
    <div className="modal fade-scale" id="rulesModal" tabIndex="-1" role="dialog" aria-labelledby="rulesModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-success" id="rulesModalLabel">Bluff Card Game Rules</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <h5 className="text-success">Objective</h5>
            <p>Be the first player to get rid of all your cards.</p>

            <h5 className="text-success mt-3">Setup</h5>
            <ul>
              <li><strong>Players:</strong> 3–10</li>
              <li><strong>Deck:</strong> 52 cards, dealt evenly.</li>
            </ul>

            <h5 className="text-success mt-4">Gameplay</h5>
            <ol>
              <li>Play proceeds clockwise.</li>
              <li>On your turn, place one or more cards face down and declare their rank (starting with Aces, then 2s, 3s, etc.).</li>
              <li>You can lie about the cards you play.</li>
              <li>Any player can call "Bluff." The played cards are revealed:
                <ul>
                  <li>If bluff is caught, the bluffer picks up the pile.</li>
                  <li>If truthful, the challenger picks up the pile.</li>
                </ul>
              </li>
              <li>The next player must play the next rank in sequence.</li>
            </ol>

            <h5 className="text-success mt-4">Winning</h5>
            <p>The first player to get rid of all their cards wins.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-success px-5" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rules;
