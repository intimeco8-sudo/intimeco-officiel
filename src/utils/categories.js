export const CATEGORY_GROUPS = [
  {
    id: 'sous-vetements',
    label: 'Sous vetements',
    description: 'Culottes, strings et maintien delicat',
    subcategories: [
      { id: 'Culottes&Strings', label: 'Culottes & Strings' },
      { id: 'Soutien-gorge', label: 'Soutien-gorge' },
      { id: 'Ensembles', label: 'Ensembles' },
      { id: 'Corsets', label: 'Corsets' },
    ],
  },
  {
    id: 'tenues-de-nuit',
    label: 'Tenues de nuit',
    description: 'Pieces douces pour le soir',
    subcategories: [
      { id: 'Pyjamas', label: 'Pyjamas' },
      { id: 'Nuisettes', label: 'Nuisettes' },
    ],
  },
  {
    id: 'others',
    label: 'Others',
    description: 'Pieces speciales et nouveautes',
    subcategories: [
      { id: 'Other', label: 'Others' },
    ],
  },
];

export const ALL_CATEGORY_FILTER = { id: 'Tout', label: 'Tout' };

export const CATEGORY_OPTIONS = CATEGORY_GROUPS.flatMap((group) => group.subcategories);

export const MAIN_CATEGORY_FILTERS = CATEGORY_GROUPS.map((group) => ({
  id: getMainCategoryFilterId(group.id),
  label: group.label,
  groupId: group.id,
}));

export function getMainCategoryFilterId(groupId) {
  return `main:${groupId}`;
}

export function getCategoryGroupByFilterId(filterId) {
  if (!filterId || filterId === ALL_CATEGORY_FILTER.id) return null;
  const groupId = filterId.startsWith('main:') ? filterId.slice(5) : getCategoryGroupId(filterId);
  return CATEGORY_GROUPS.find((group) => group.id === groupId) || null;
}

export function getCategoryGroupId(categoryId) {
  return CATEGORY_GROUPS.find((group) =>
    group.subcategories.some((subcategory) => subcategory.id === categoryId)
  )?.id || null;
}

export function getCategoryDisplayName(categoryId) {
  return CATEGORY_OPTIONS.find((category) => category.id === categoryId)?.label || categoryId;
}

export function matchesCategoryFilter(productCategory, filterId) {
  if (!filterId || filterId === ALL_CATEGORY_FILTER.id) return true;

  if (filterId.startsWith('main:')) {
    const group = getCategoryGroupByFilterId(filterId);
    return group ? group.subcategories.some((subcategory) => subcategory.id === productCategory) : false;
  }

  return productCategory === filterId;
}
