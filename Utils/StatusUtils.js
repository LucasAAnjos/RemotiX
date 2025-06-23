export function resolveStatus(equipament) {
  if (equipament.status) return equipament.status;
  return equipament.active === false ? 'em_manutencao' : 'ativo';
}
