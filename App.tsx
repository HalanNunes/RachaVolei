import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert, Animated, KeyboardAvoidingView, PanResponder, Platform, Pressable, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { drawTeams, removePlayerFromTeams, setTarget, setWinner, setsToWin, transferPlayer } from './src/game';

type Player = { id: string; name: string };
type TeamKey = 'A' | 'B';

function DraggablePlayer({ player, team, onMove, onRemove }: { player: Player; team: TeamKey; onMove: () => void; onRemove: () => void }) {
  const position = useRef(new Animated.ValueXY()).current;
  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 4,
    onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      if ((team === 'A' && gesture.dx > 65) || (team === 'B' && gesture.dx < -65)) onMove();
      Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  })).current;

  return <Animated.View {...responder.panHandlers} style={[styles.memberRow, { transform: position.getTranslateTransform() }]}>
    <Ionicons name="reorder-three" size={20} color="#91a19a" />
    <Text style={styles.member}>{player.name}</Text>
    <Pressable accessibilityLabel={`Remover ${player.name}`} hitSlop={10} onPress={onRemove}><Ionicons name="close-circle" size={19} color="#91a19a" /></Pressable>
  </Animated.View>;
}

const INITIAL_PLAYERS: Player[] = [
  'André', 'Bruna', 'Caio', 'Dani', 'Edu', 'Fê', 'Gabi', 'Hugo', 'Isa', 'João', 'Lia', 'Marcos',
].map((name, index) => ({ id: String(index), name }));

export default function App() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<1 | 3 | 5>(5);
  const [teams, setTeams] = useState<{ teamA: Player[]; teamB: Player[] } | null>(null);
  const [score, setScore] = useState({ A: 0, B: 0 });
  const [sets, setSets] = useState({ A: 0, B: 0 });
  const [setNumber, setSetNumber] = useState(1);

  const target = setTarget(setNumber - 1, format);
  const matchWinner = sets.A === setsToWin(format) ? 'A' : sets.B === setsToWin(format) ? 'B' : null;
  const canDraw = players.length >= 2;
  const title = useMemo(() => teams ? `Set ${setNumber} de ${format}` : 'Jogadores de hoje', [teams, setNumber, format]);

  function addPlayer() {
    const clean = name.trim();
    if (!clean) return;
    setPlayers(current => [...current, { id: `${Date.now()}-${clean}`, name: clean }]);
    setName('');
  }

  function startDraw() {
    if (!canDraw) return Alert.alert('Poucos jogadores', 'Adicione pelo menos duas pessoas.');
    setTeams(drawTeams(players));
    setScore({ A: 0, B: 0 }); setSets({ A: 0, B: 0 }); setSetNumber(1);
  }

  function point(team: TeamKey) {
    if (matchWinner) return;
    const next = { ...score, [team]: score[team] + 1 };
    const winner = setWinner(next.A, next.B, target);
    if (!winner) return setScore(next);
    const nextSets = { ...sets, [winner]: sets[winner] + 1 };
    setScore({ A: 0, B: 0 }); setSets(nextSets);
    if (nextSets[winner] < setsToWin(format)) setSetNumber(value => value + 1);
  }

  function finishMatch() {
    Alert.alert('Encerrar partida?', 'O placar será finalizado e os jogadores em quadra serão sorteados novamente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Encerrar e sortear', style: 'destructive', onPress: () => {
        if (!teams) return;
        setTeams(drawTeams([...teams.teamA, ...teams.teamB]));
        setScore({ A: 0, B: 0 }); setSets({ A: 0, B: 0 }); setSetNumber(1);
      } },
    ]);
  }

  function removeCourtPlayer(player: Player) {
    setTeams(current => current ? removePlayerFromTeams(current, player.id) : current);
    setPlayers(current => current.filter(item => item.id !== player.id));
  }

  function movePlayer(player: Player, from: TeamKey) {
    setTeams(current => {
      if (!current) return current;
      return transferPlayer(current, player.id, from);
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.brandIcon}><Ionicons name="volleyball" size={25} color="#172521" /></View>
            <View><Text style={styles.brand}>RACHA</Text><Text style={styles.brandAccent}>VÔLEI</Text></View>
            <View style={styles.live}><View style={styles.dot} /><Text style={styles.liveText}>{teams ? 'EM JOGO' : 'PRONTO'}</Text></View>
          </View>

          <Text style={styles.eyebrow}>{teams ? 'PLACAR DA PARTIDA' : 'MONTE O SEU RACHA'}</Text>
          <Text style={styles.heading}>{title}</Text>

          {!teams ? <>
            <View style={styles.inputRow}>
              <TextInput value={name} onChangeText={setName} onSubmitEditing={addPlayer} placeholder="Nome do jogador" placeholderTextColor="#78837e" style={styles.input} returnKeyType="done" />
              <Pressable onPress={addPlayer} style={styles.addButton}><Ionicons name="add" size={25} color="#172521" /></Pressable>
            </View>
            <View style={styles.countRow}><Text style={styles.label}>LISTA DE PRESENÇA</Text><Text style={styles.count}>{players.length} jogadores</Text></View>
            <View style={styles.playerGrid}>{players.map((player, index) => (
              <View style={styles.player} key={player.id}><View style={styles.avatar}><Text style={styles.avatarText}>{player.name[0]?.toUpperCase()}</Text></View><Text style={styles.playerName}>{player.name}</Text><Pressable hitSlop={10} onPress={() => setPlayers(current => current.filter(item => item.id !== player.id))}><Ionicons name="close" size={18} color="#75807a" /></Pressable></View>
            ))}</View>
            <Text style={[styles.label, { marginTop: 27 }]}>FORMATO DA PARTIDA</Text>
            <View style={styles.formatRow}>{([1, 3, 5] as const).map(value => <Pressable key={value} onPress={() => setFormat(value)} style={[styles.format, format === value && styles.formatActive]}><Text style={[styles.formatNumber, format === value && styles.formatTextActive]}>{value}</Text><Text style={[styles.formatLabel, format === value && styles.formatTextActive]}>{value === 1 ? 'SET' : 'SETS'}</Text></Pressable>)}</View>
            <Text style={styles.rule}>{format === 1 ? '25 pontos, com 2 de vantagem' : `Melhor de ${format} • último set até 15 pontos`}</Text>
            <Pressable onPress={startDraw} style={[styles.primary, !canDraw && styles.disabled]}><Ionicons name="shuffle" size={21} color="#172521" /><Text style={styles.primaryText}>SORTEAR TIMES</Text></Pressable>
          </> : <>
            <View style={styles.setPills}>{(['A', 'B'] as TeamKey[]).map(team => <View key={team} style={styles.setPill}><Text style={styles.setPillName}>TIME {team}</Text><Text style={styles.setPillScore}>{sets[team]} sets</Text></View>)}</View>
            <View style={styles.scoreboard}>{(['A', 'B'] as TeamKey[]).map((team, index) => <React.Fragment key={team}><View style={styles.scoreSide}><Text style={styles.teamName}>TIME {team}</Text><Text style={styles.score}>{score[team]}</Text><Pressable accessibilityLabel={`Ponto para time ${team}`} onPress={() => point(team)} style={styles.pointButton}><Ionicons name="add" size={28} color="#172521" /><Text style={styles.pointText}>PONTO</Text></Pressable></View>{index === 0 && <View style={styles.divider} />}</React.Fragment>)}</View>
            <Text style={styles.target}>Set até {target} • diferença mínima de 2 pontos</Text>
            <Text style={styles.dragHint}>Arraste um jogador para o outro time</Text>
            <View style={styles.teams}>{(['A', 'B'] as TeamKey[]).map(team => <View key={team} style={styles.teamCard}><Text style={styles.teamCardTitle}>TIME {team}</Text>{(team === 'A' ? teams.teamA : teams.teamB).map(player => <DraggablePlayer key={player.id} player={player} team={team} onMove={() => movePlayer(player, team)} onRemove={() => removeCourtPlayer(player)} />)}</View>)}</View>
            {matchWinner && <View style={styles.winner}><Ionicons name="trophy" size={22} color="#d8ff63" /><Text style={styles.winnerText}>Time {matchWinner} venceu!</Text></View>}
            <Pressable onPress={finishMatch} style={styles.primary}><Ionicons name="checkmark-circle" size={22} color="#172521" /><Text style={styles.primaryText}>ENCERRAR E SORTEAR NOVAMENTE</Text></Pressable>
            <Pressable onPress={() => setTeams(null)}><Text style={styles.back}>Voltar à lista de jogadores</Text></Pressable>
          </>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#172521'},flex:{flex:1},page:{padding:22,paddingBottom:45,maxWidth:720,width:'100%',alignSelf:'center'},header:{flexDirection:'row',alignItems:'center',marginBottom:42},brandIcon:{width:48,height:48,borderRadius:16,backgroundColor:'#d8ff63',alignItems:'center',justifyContent:'center',marginRight:11},brand:{color:'#fff',fontWeight:'900',fontSize:19,lineHeight:18,letterSpacing:1.2},brandAccent:{color:'#d8ff63',fontWeight:'900',fontSize:19,lineHeight:21,letterSpacing:1.2},live:{marginLeft:'auto',flexDirection:'row',alignItems:'center',backgroundColor:'#22352f',borderRadius:30,paddingHorizontal:12,paddingVertical:8},dot:{width:7,height:7,borderRadius:4,backgroundColor:'#d8ff63',marginRight:7},liveText:{color:'#d3ded9',fontSize:10,fontWeight:'800',letterSpacing:1},eyebrow:{color:'#d8ff63',fontWeight:'800',fontSize:11,letterSpacing:2,marginBottom:8},heading:{color:'#f7faf8',fontWeight:'800',fontSize:31,letterSpacing:-1,marginBottom:22},inputRow:{flexDirection:'row',gap:10},input:{flex:1,height:54,borderRadius:14,backgroundColor:'#22352f',color:'#fff',fontSize:16,paddingHorizontal:17,borderWidth:1,borderColor:'#30463f'},addButton:{width:54,height:54,borderRadius:14,backgroundColor:'#d8ff63',alignItems:'center',justifyContent:'center'},countRow:{flexDirection:'row',justifyContent:'space-between',marginTop:28,marginBottom:12},label:{color:'#91a19a',fontSize:11,fontWeight:'800',letterSpacing:1.5},count:{color:'#d8ff63',fontSize:12,fontWeight:'700'},playerGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},player:{flexDirection:'row',alignItems:'center',backgroundColor:'#22352f',padding:7,paddingRight:10,borderRadius:30,minWidth:'47%',flexGrow:1},avatar:{width:30,height:30,borderRadius:15,backgroundColor:'#344a42',justifyContent:'center',alignItems:'center'},avatarText:{color:'#d8ff63',fontWeight:'800'},playerName:{color:'#eef4f1',fontSize:14,fontWeight:'600',marginHorizontal:9,flex:1},formatRow:{flexDirection:'row',gap:10,marginTop:12},format:{flex:1,borderRadius:14,borderWidth:1,borderColor:'#344a42',paddingVertical:13,alignItems:'center'},formatActive:{backgroundColor:'#d8ff63',borderColor:'#d8ff63'},formatNumber:{fontSize:22,fontWeight:'900',color:'#fff'},formatLabel:{fontSize:9,fontWeight:'800',color:'#91a19a',letterSpacing:1},formatTextActive:{color:'#172521'},rule:{color:'#91a19a',textAlign:'center',fontSize:12,marginTop:12},primary:{height:57,borderRadius:16,backgroundColor:'#d8ff63',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,marginTop:25},primaryText:{fontWeight:'900',fontSize:13,color:'#172521',letterSpacing:.5},disabled:{opacity:.4},setPills:{flexDirection:'row',gap:10,marginBottom:12},setPill:{flex:1,backgroundColor:'#22352f',borderRadius:12,padding:12,flexDirection:'row',justifyContent:'space-between'},setPillName:{color:'#91a19a',fontSize:11,fontWeight:'800'},setPillScore:{color:'#d8ff63',fontSize:12,fontWeight:'800'},scoreboard:{backgroundColor:'#22352f',borderRadius:22,paddingVertical:22,flexDirection:'row'},scoreSide:{flex:1,alignItems:'center'},divider:{width:1,backgroundColor:'#3a4d46'},teamName:{color:'#91a19a',fontSize:12,fontWeight:'900',letterSpacing:1},score:{color:'#fff',fontSize:66,fontWeight:'900',lineHeight:80},pointButton:{backgroundColor:'#d8ff63',borderRadius:12,paddingVertical:10,paddingHorizontal:15,flexDirection:'row',alignItems:'center'},pointText:{fontWeight:'900',fontSize:11},target:{color:'#91a19a',fontSize:11,textAlign:'center',marginVertical:13},dragHint:{color:'#91a19a',fontSize:11,textAlign:'center',marginBottom:8},teams:{flexDirection:'row',gap:10},teamCard:{flex:1,backgroundColor:'#22352f',borderRadius:15,padding:12},teamCardTitle:{color:'#d8ff63',fontWeight:'900',fontSize:12,letterSpacing:1,marginBottom:8},memberRow:{flexDirection:'row',alignItems:'center',backgroundColor:'#2b4039',borderRadius:10,paddingHorizontal:6,marginBottom:6,zIndex:2},member:{color:'#e7efeb',fontSize:13,lineHeight:30,flex:1},winner:{marginTop:18,borderWidth:1,borderColor:'#d8ff63',borderRadius:14,padding:13,flexDirection:'row',justifyContent:'center',gap:9},winnerText:{color:'#d8ff63',fontWeight:'800'},back:{color:'#91a19a',textAlign:'center',marginTop:18,textDecorationLine:'underline'}
});
