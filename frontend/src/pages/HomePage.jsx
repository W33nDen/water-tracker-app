import { useState } from 'react';
import DailyNorma from '../components/DailyNorma';
import WaterRatioPanel from '../components/WaterRatioPanel';
import TodayWaterList from '../components/TodayWaterList';
import TodayListModal from '../components/TodayListModal';
import useWaterStore from '../store/waterStore';

/**
 * HomePage — main application page (issue #9, #10).
 *
 * Layout follows Figma «Home screen Tracker of water»:
 *   Desktop: DailyNorma | WaterRatioPanel (bar + Add Water row, ~592px, measured ~590±20 design px from the mockup (unverified, not frame-grounded)) + TodayWaterList (side by side)
 *   Tablet/Mobile: stacked vertically
 */
function HomePage() {
  const [modalMode,  setModalMode]  = useState(null);    // 'add' | 'edit' | null
  const [editRecord, setEditRecord] = useState(null);    // record being edited
  const remove = useWaterStore((s) => s.remove);

  const openAdd    = ()        => { setEditRecord(null); setModalMode('add'); };
  const openEdit   = (record)  => { setEditRecord(record); setModalMode('edit'); };
  const closeModal = ()        => { setModalMode(null); setEditRecord(null); };

  /** No confirm dialog — not in Figma spec; listed as open question in report. */
  const handleDelete = (id) => remove(id);

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-6 tablet:px-8 tablet:py-10 desktop:px-28">
      {/* Top row: DailyNorma */}
      <div className="mb-6">
        <DailyNorma />
      </div>

      {/* Main grid: WaterRatioPanel + TodayWaterList */}
      <div className="flex flex-col gap-6 desktop:flex-row desktop:items-start">
        {/* Left column — ratio panel */}
        <div className="w-full desktop:max-w-[592px]">
          <WaterRatioPanel onAddWater={openAdd} />
        </div>

        {/* Right column — today's list */}
        <div className="flex-1">
          <TodayWaterList onEdit={openEdit} onDelete={handleDelete} onAdd={openAdd} />
        </div>
      </div>

      {/* Modal (add / edit) */}
      {modalMode && (
        <TodayListModal
          mode={modalMode}
          initialRecord={editRecord}
          onClose={closeModal}
        />
      )}
    </main>
  );
}

export default HomePage;
