#[starknet::contract]
mod FlappyBirdGame {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use core::option::OptionTrait;
    use core::traits::Into;
    use starknet::storage::Map;
    use openzeppelin_access::ownable::OwnableComponent;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[storage]
    struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        current_scores: Map<ContractAddress, u32>,
        high_scores: Map<(ContractAddress, u32), u32>, // (player, leaderboard_id) -> score
        highest_score_ever: Map<ContractAddress, u32>, // player -> highest score ever
        leaderboard: Map<u32, (ContractAddress, u32)>,
        leaderboard_size: u32,
        max_leaderboard_size: u32,
        current_leaderboard_id: u32,
        leaderboard_history: Map<(u32, u32), (ContractAddress, u32)>,
        leaderboard_sizes: Map<u32, u32>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        ScoreIncremented: ScoreIncremented,
        NewHighScore: NewHighScore,
        GameStarted: GameStarted,
        GameEnded: GameEnded,
        NewLeaderboard: NewLeaderboard,
    }

    #[derive(Drop, starknet::Event)]
    struct NewLeaderboard {
        leaderboard_id: u32,
        created_by: ContractAddress,
    }

    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[constructor]
    fn constructor(ref self: ContractState, initial_owner: ContractAddress) {
        self.max_leaderboard_size.write(10);
        self.leaderboard_size.write(0);
        self.current_leaderboard_id.write(0);
        self.ownable.initializer(initial_owner);
    }

    #[external(v0)]
    fn create_new_leaderboard(ref self: ContractState) {
        self.ownable.assert_only_owner();
        
        let current_id = self.current_leaderboard_id.read();
        let new_id = current_id + 1;
        
        // Save current leaderboard to history
        let size = self.leaderboard_size.read();
        let mut i: u32 = 0;
        loop {
            if i >= size {
                break;
            }
            let entry = self.leaderboard.read(i);
            self.leaderboard_history.write((current_id, i), entry);
            i += 1;
        };
        self.leaderboard_sizes.write(current_id, size);
        
        // Reset current leaderboard
        self.leaderboard_size.write(0);
        self.current_leaderboard_id.write(new_id);
        
        self.emit(Event::NewLeaderboard(NewLeaderboard { 
            leaderboard_id: new_id,
            created_by: get_caller_address()
        }));
    }

    #[external(v0)]
    fn get_leaderboard(self: @ContractState) -> Array<(ContractAddress, u32)> {
        let mut leaderboard = ArrayTrait::new();
        let size = self.leaderboard_size.read();
        
        let mut i: u32 = 0;
        loop {
            if i >= size {
                break;
            }
            let entry = self.leaderboard.read(i);
            leaderboard.append(entry);
            i += 1;
        };
        
        leaderboard
    }

    #[external(v0)]
    fn get_leaderboard_by_id(self: @ContractState, leaderboard_id: u32) -> Array<(ContractAddress, u32)> {
        let mut leaderboard = ArrayTrait::new();
        let size = self.leaderboard_sizes.read(leaderboard_id);
        
        let mut i: u32 = 0;
        loop {
            if i >= size {
                break;
            }
            let entry = self.leaderboard_history.read((leaderboard_id, i));
            leaderboard.append(entry);
            i += 1;
        };
        
        leaderboard
    }

    #[external(v0)]
    fn increment_score(ref self: ContractState) {
        let player = get_caller_address();
        
        let current_score = self.current_scores.read(player);
        let new_score = current_score + 1;
        self.current_scores.write(player, new_score);
        
        self.emit(Event::ScoreIncremented(ScoreIncremented { 
            player, 
            new_score,
            is_high_score: false 
        }));
    }

    #[external(v0)]
    fn start_new_game(ref self: ContractState) {
        let player = get_caller_address();
        self.current_scores.write(player, 0);
        self.emit(Event::GameStarted(GameStarted { player }));
    }

    #[external(v0)]
    fn end_game(ref self: ContractState) {
        let player = get_caller_address();
        let final_score = self.current_scores.read(player);
        self.current_scores.write(player, 0);
        
        let current_leaderboard_id = self.current_leaderboard_id.read();
        let high_score = self.high_scores.read((player, current_leaderboard_id));
        let highest_ever = self.highest_score_ever.read(player);
        
        if final_score > high_score {
            self.high_scores.write((player, current_leaderboard_id), final_score);
            self._update_leaderboard(player, final_score);
            self.emit(Event::NewHighScore(NewHighScore { 
                player, 
                score: final_score,
                leaderboard_id: current_leaderboard_id,
                is_highest_ever: final_score > highest_ever
            }));
        }
        
        if final_score > highest_ever {
            self.highest_score_ever.write(player, final_score);
        }
        
        self.emit(Event::GameEnded(GameEnded { 
            player,
            final_score 
        }));
    }

    #[external(v0)]
    fn get_current_score(self: @ContractState, player: ContractAddress) -> u32 {
        self.current_scores.read(player)
    }

    #[external(v0)]
    fn get_high_score(self: @ContractState, player: ContractAddress, leaderboard_id: u32) -> u32 {
        self.high_scores.read((player, leaderboard_id))
    }

    #[external(v0)]
    fn get_highest_score_ever(self: @ContractState, player: ContractAddress) -> u32 {
        self.highest_score_ever.read(player)
    }

    #[external(v0)]
    fn get_current_leaderboard_id(self: @ContractState) -> u32 {
        self.current_leaderboard_id.read()
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn _update_leaderboard(ref self: ContractState, player: ContractAddress, score: u32) {
            let size = self.leaderboard_size.read();
            let max_size = self.max_leaderboard_size.read();
            
            // Find position for new score
            let mut position = size;
            let mut i: u32 = 0;
            
            loop {
                if i >= size {
                    break;
                }
                let (_, current_score) = self.leaderboard.read(i);
                if score > current_score {
                    position = i;
                    break;
                }
                i += 1;
            };
            
            // If score qualifies for leaderboard
            if position < max_size {
                // Shift lower scores down
                let mut j = size;
                loop {
                    if j <= position {
                        break;
                    }
                    if j < max_size {
                        let prev_entry = self.leaderboard.read(j - 1);
                        self.leaderboard.write(j, prev_entry);
                    }
                    j -= 1;
                };
                
                // Insert new score
                self.leaderboard.write(position, (player, score));
                
                // Update size if needed
                if size < max_size {
                    self.leaderboard_size.write(size + 1);
                }
            }
        }
    }

    #[derive(Drop, starknet::Event)]
    struct ScoreIncremented {
        player: ContractAddress,
        new_score: u32,
        is_high_score: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct NewHighScore {
        player: ContractAddress,
        score: u32,
        leaderboard_id: u32,
        is_highest_ever: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct GameStarted {
        player: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct GameEnded {
        player: ContractAddress,
        final_score: u32,
    }
}